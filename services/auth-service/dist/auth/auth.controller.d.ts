import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, UpdateProfileDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshTokenDto): Promise<{
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
    logout(dto: RefreshTokenDto): Promise<{
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
}
