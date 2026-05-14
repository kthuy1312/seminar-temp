import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto, LoginDto, UpdateProfileDto } from './dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly refreshTokenRepository;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(userRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string | undefined;
        user: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string;
            role: import("../entities/user.entity").UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string | undefined;
        user: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string;
            role: import("../entities/user.entity").UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    refreshToken(refreshTokenValue: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string | undefined;
        user: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string;
            role: import("../entities/user.entity").UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    logout(refreshTokenValue: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        avatarUrl: string;
        role: import("../entities/user.entity").UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        fullName: string;
        avatarUrl: string;
        role: import("../entities/user.entity").UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private generateTokens;
    private sanitizeUser;
    private calculateExpiry;
}
