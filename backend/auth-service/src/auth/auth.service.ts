import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── REGISTER ──────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Tạo user
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`User registered: ${savedUser.email}`);

    // Tạo tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  // ─── LOGIN ─────────────────────────────────────────────────

  async login(dto: LoginDto) {
    // Tìm user theo email
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // So sánh password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    this.logger.log(`User logged in: ${user.email}`);

    // Tạo tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  // ─── REFRESH TOKEN ─────────────────────────────────────────

  async refreshToken(refreshTokenValue: string) {
    // Tìm refresh token trong DB
    const storedToken = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshTokenValue,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Revoke token cũ (rotation)
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Tạo tokens mới
    const tokens = await this.generateTokens(storedToken.user);

    this.logger.log(`Token refreshed for user: ${storedToken.user.email}`);

    return {
      user: this.sanitizeUser(storedToken.user),
      ...tokens,
    };
  }

  // ─── LOGOUT ────────────────────────────────────────────────

  async logout(refreshTokenValue: string) {
    const result = await this.refreshTokenRepository.update(
      { token: refreshTokenValue, isRevoked: false },
      { isRevoked: true },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Token không tìm thấy');
    }

    return { message: 'Đăng xuất thành công' };
  }

  // ─── PROFILE ───────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Cập nhật các field được gửi lên
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`Profile updated for user: ${updatedUser.email}`);

    return this.sanitizeUser(updatedUser);
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────

  /**
   * Tạo cặp access token + refresh token
   */
  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Access token (ngắn hạn)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });

    // Refresh token (dài hạn) — lưu vào DB
    const refreshTokenValue = uuidv4();
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    };
  }

  /**
   * Loại bỏ password khỏi user object
   */
  private sanitizeUser(user: User) {
    const { password, refreshTokens, ...result } = user;
    return result;
  }

  /**
   * Tính thời gian hết hạn từ string như "7d", "15m"
   */
  private calculateExpiry(duration: string): Date {
    const now = new Date();
    const value = parseInt(duration);
    const unit = duration.replace(/\d+/g, '');

    switch (unit) {
      case 'm':
        now.setMinutes(now.getMinutes() + value);
        break;
      case 'h':
        now.setHours(now.getHours() + value);
        break;
      case 'd':
        now.setDate(now.getDate() + value);
        break;
      default:
        now.setDate(now.getDate() + 7); // fallback 7 ngày
    }

    return now;
  }
}
