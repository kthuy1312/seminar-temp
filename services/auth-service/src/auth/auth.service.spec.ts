import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User, UserRole } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

// ─── MOCK DATA ──────────────────────────────────────────────

const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password: '$2b$10$hashedPasswordHere', // bcrypt hash
  fullName: 'Test User',
  avatarUrl: "",
  role: UserRole.STUDENT,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  refreshTokens: [],
};

// ─── MOCK REPOSITORIES ─────────────────────────────────────

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockRefreshTokenRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

// ─── MOCK SERVICES ──────────────────────────────────────────

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'jwt.accessSecret': 'test-access-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.accessExpiresIn': '15m',
      'jwt.refreshExpiresIn': '7d',
    };
    return config[key];
  }),
};

// ─── TEST SUITE ─────────────────────────────────────────────

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    // Reset tất cả mock trước mỗi test
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'Pass123',
      fullName: 'New User',
    };

    it('✅ đăng ký thành công — trả về user + tokens', async () => {
      // Arrange: email chưa tồn tại
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        ...mockUser,
        email: registerDto.email,
        fullName: registerDto.fullName,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        fullName: registerDto.fullName,
      });
      mockRefreshTokenRepository.create.mockReturnValue({
        token: 'mock-refresh-token',
      });
      mockRefreshTokenRepository.save.mockResolvedValue({
        token: 'mock-refresh-token',
      });

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.fullName).toBe(registerDto.fullName);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();

      // Verify password không nằm trong response
      expect(result.user).not.toHaveProperty('password');

      // Verify các mock được gọi đúng
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('❌ đăng ký thất bại — email đã tồn tại', async () => {
      // Arrange: email đã có trong DB
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(authService.register(registerDto)).rejects.toThrow(
        'Email đã được sử dụng',
      );

      // Verify không tạo user mới
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('✅ password được hash trước khi lưu', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation((data) => ({
        ...mockUser,
        ...data,
      }));
      mockUserRepository.save.mockImplementation((user) =>
        Promise.resolve(user),
      );
      mockRefreshTokenRepository.create.mockReturnValue({
        token: 'mock-refresh-token',
      });
      mockRefreshTokenRepository.save.mockResolvedValue({});

      // Act
      await authService.register(registerDto);

      // Assert: password truyền vào create phải là hash, không phải plaintext
      const createCall = mockUserRepository.create.mock.calls[0][0];
      expect(createCall.password).not.toBe(registerDto.password);
      expect(createCall.password).toMatch(/^\$2[aby]?\$/); // bcrypt hash pattern
    });
  });

  // ─────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Pass123',
    };

    it('✅ đăng nhập thành công — trả về user + tokens', async () => {
      // Arrange: hash password thật để bcrypt.compare hoạt động
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const userWithHash = { ...mockUser, password: hashedPassword };

      mockUserRepository.findOne.mockResolvedValue(userWithHash);
      mockRefreshTokenRepository.create.mockReturnValue({
        token: 'mock-refresh-token',
      });
      mockRefreshTokenRepository.save.mockResolvedValue({});

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe(loginDto.email);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password');

      // Verify JWT được tạo với đúng payload
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        expect.objectContaining({
          secret: 'test-access-secret',
          expiresIn: '15m',
        }),
      );
    });

    it('❌ đăng nhập thất bại — email không tồn tại', async () => {
      // Arrange: user không tìm thấy
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Email hoặc mật khẩu không đúng',
      );
    });

    it('❌ đăng nhập thất bại — sai password', async () => {
      // Arrange: password hash khác với password nhập vào
      const wrongPasswordHash = await bcrypt.hash('DifferentPassword1', 10);
      const userWithWrongHash = { ...mockUser, password: wrongPasswordHash };

      mockUserRepository.findOne.mockResolvedValue(userWithWrongHash);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Email hoặc mật khẩu không đúng',
      );

      // Verify không tạo token khi password sai
      expect(mockJwtService.sign).not.toHaveBeenCalled();
      expect(mockRefreshTokenRepository.create).not.toHaveBeenCalled();
    });

    it('❌ đăng nhập thất bại — password rỗng', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash('Pass123', 10);
      const userWithHash = { ...mockUser, password: hashedPassword };
      mockUserRepository.findOne.mockResolvedValue(userWithHash);

      const emptyPasswordDto = { email: 'test@example.com', password: '' };

      // Act & Assert: bcrypt.compare('', hash) → false
      await expect(authService.login(emptyPasswordDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    it('✅ refresh thành công — revoke token cũ + trả token mới', async () => {
      // Arrange
      const storedToken = {
        id: 'token-id',
        token: 'valid-refresh-token',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000), // +1 ngày
        user: { ...mockUser },
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(storedToken);
      mockRefreshTokenRepository.save.mockResolvedValue(storedToken);
      mockRefreshTokenRepository.create.mockReturnValue({
        token: 'new-refresh-token',
      });

      // Act
      const result = await authService.refreshToken('valid-refresh-token');

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();

      // Verify token cũ bị revoke
      expect(storedToken.isRevoked).toBe(true);
      expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
    });

    it('❌ refresh thất bại — token không hợp lệ', async () => {
      // Arrange: token không tìm thấy
      mockRefreshTokenRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.refreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        authService.refreshToken('invalid-token'),
      ).rejects.toThrow('Refresh token không hợp lệ hoặc đã hết hạn');
    });
  });
});
