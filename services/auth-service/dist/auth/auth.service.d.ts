import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepository;
    private refreshTokenRepository;
    private jwtService;
    private configService;
    constructor(userRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    refresh(token: string): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
    }>;
    logout(token: string): Promise<void>;
    private generateTokens;
}
