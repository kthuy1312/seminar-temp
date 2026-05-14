"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const auth_service_1 = require("./auth.service");
const user_entity_1 = require("../entities/user.entity");
const refresh_token_entity_1 = require("../entities/refresh-token.entity");
const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: '$2b$10$hashedPasswordHere',
    fullName: 'Test User',
    avatarUrl: "",
    role: user_entity_1.UserRole.STUDENT,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    refreshTokens: [],
};
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
const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-access-token'),
};
const mockConfigService = {
    get: jest.fn((key) => {
        const config = {
            'jwt.accessSecret': 'test-access-secret',
            'jwt.refreshSecret': 'test-refresh-secret',
            'jwt.accessExpiresIn': '15m',
            'jwt.refreshExpiresIn': '7d',
        };
        return config[key];
    }),
};
describe('AuthService', () => {
    let authService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(user_entity_1.User),
                    useValue: mockUserRepository,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(refresh_token_entity_1.RefreshToken),
                    useValue: mockRefreshTokenRepository,
                },
                {
                    provide: jwt_1.JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        authService = module.get(auth_service_1.AuthService);
        jest.clearAllMocks();
    });
    describe('register', () => {
        const registerDto = {
            email: 'newuser@example.com',
            password: 'Pass123',
            fullName: 'New User',
        };
        it('✅ đăng ký thành công — trả về user + tokens', async () => {
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
            const result = await authService.register(registerDto);
            expect(result).toBeDefined();
            expect(result.user.email).toBe(registerDto.email);
            expect(result.user.fullName).toBe(registerDto.fullName);
            expect(result.accessToken).toBe('mock-access-token');
            expect(result.refreshToken).toBeDefined();
            expect(result.user).not.toHaveProperty('password');
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: registerDto.email },
            });
            expect(mockUserRepository.create).toHaveBeenCalled();
            expect(mockUserRepository.save).toHaveBeenCalled();
        });
        it('❌ đăng ký thất bại — email đã tồn tại', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            await expect(authService.register(registerDto)).rejects.toThrow(common_1.ConflictException);
            await expect(authService.register(registerDto)).rejects.toThrow('Email đã được sử dụng');
            expect(mockUserRepository.create).not.toHaveBeenCalled();
            expect(mockUserRepository.save).not.toHaveBeenCalled();
        });
        it('✅ password được hash trước khi lưu', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            mockUserRepository.create.mockImplementation((data) => ({
                ...mockUser,
                ...data,
            }));
            mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));
            mockRefreshTokenRepository.create.mockReturnValue({
                token: 'mock-refresh-token',
            });
            mockRefreshTokenRepository.save.mockResolvedValue({});
            await authService.register(registerDto);
            const createCall = mockUserRepository.create.mock.calls[0][0];
            expect(createCall.password).not.toBe(registerDto.password);
            expect(createCall.password).toMatch(/^\$2[aby]?\$/);
        });
    });
    describe('login', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'Pass123',
        };
        it('✅ đăng nhập thành công — trả về user + tokens', async () => {
            const hashedPassword = await bcrypt.hash(loginDto.password, 10);
            const userWithHash = { ...mockUser, password: hashedPassword };
            mockUserRepository.findOne.mockResolvedValue(userWithHash);
            mockRefreshTokenRepository.create.mockReturnValue({
                token: 'mock-refresh-token',
            });
            mockRefreshTokenRepository.save.mockResolvedValue({});
            const result = await authService.login(loginDto);
            expect(result).toBeDefined();
            expect(result.user.email).toBe(loginDto.email);
            expect(result.accessToken).toBe('mock-access-token');
            expect(result.refreshToken).toBeDefined();
            expect(result.user).not.toHaveProperty('password');
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            }, expect.objectContaining({
                secret: 'test-access-secret',
                expiresIn: '15m',
            }));
        });
        it('❌ đăng nhập thất bại — email không tồn tại', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(authService.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.login(loginDto)).rejects.toThrow('Email hoặc mật khẩu không đúng');
        });
        it('❌ đăng nhập thất bại — sai password', async () => {
            const wrongPasswordHash = await bcrypt.hash('DifferentPassword1', 10);
            const userWithWrongHash = { ...mockUser, password: wrongPasswordHash };
            mockUserRepository.findOne.mockResolvedValue(userWithWrongHash);
            await expect(authService.login(loginDto)).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.login(loginDto)).rejects.toThrow('Email hoặc mật khẩu không đúng');
            expect(mockJwtService.sign).not.toHaveBeenCalled();
            expect(mockRefreshTokenRepository.create).not.toHaveBeenCalled();
        });
        it('❌ đăng nhập thất bại — password rỗng', async () => {
            const hashedPassword = await bcrypt.hash('Pass123', 10);
            const userWithHash = { ...mockUser, password: hashedPassword };
            mockUserRepository.findOne.mockResolvedValue(userWithHash);
            const emptyPasswordDto = { email: 'test@example.com', password: '' };
            await expect(authService.login(emptyPasswordDto)).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('refreshToken', () => {
        it('✅ refresh thành công — revoke token cũ + trả token mới', async () => {
            const storedToken = {
                id: 'token-id',
                token: 'valid-refresh-token',
                isRevoked: false,
                expiresAt: new Date(Date.now() + 86400000),
                user: { ...mockUser },
            };
            mockRefreshTokenRepository.findOne.mockResolvedValue(storedToken);
            mockRefreshTokenRepository.save.mockResolvedValue(storedToken);
            mockRefreshTokenRepository.create.mockReturnValue({
                token: 'new-refresh-token',
            });
            const result = await authService.refreshToken('valid-refresh-token');
            expect(result).toBeDefined();
            expect(result.accessToken).toBe('mock-access-token');
            expect(result.refreshToken).toBeDefined();
            expect(storedToken.isRevoked).toBe(true);
            expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
        });
        it('❌ refresh thất bại — token không hợp lệ', async () => {
            mockRefreshTokenRepository.findOne.mockResolvedValue(null);
            await expect(authService.refreshToken('invalid-token')).rejects.toThrow(common_1.UnauthorizedException);
            await expect(authService.refreshToken('invalid-token')).rejects.toThrow('Refresh token không hợp lệ hoặc đã hết hạn');
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map