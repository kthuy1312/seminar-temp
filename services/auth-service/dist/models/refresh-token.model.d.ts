import { Model } from 'sequelize-typescript';
import { UserModel } from './user.model';
export declare class RefreshTokenModel extends Model {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
    user: UserModel;
}
