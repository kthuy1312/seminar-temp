import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
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
    logout(refreshTokenDto: RefreshTokenDto): Promise<void>;
    getProfile(req: any): Promise<any>;
}
