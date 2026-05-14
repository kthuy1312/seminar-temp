import { Model } from 'sequelize-typescript';
import { RefreshTokenModel } from './refresh-token.model';
export declare enum UserRole {
    STUDENT = "student",
    TEACHER = "teacher",
    ADMIN = "admin"
}
export declare class UserModel extends Model {
    id: string;
    email: string;
    password: string;
    fullName: string;
    avatarUrl: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    refreshTokens: RefreshTokenModel[];
}
