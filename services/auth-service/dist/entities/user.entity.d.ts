import { RefreshToken } from './refresh-token.entity';
export declare enum UserRole {
    STUDENT = "student",
    TEACHER = "teacher",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    avatarUrl: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    refreshTokens: RefreshToken[];
}
