// ============================================================
// Sequelize Models — Auth Service
// File: services/auth-service/src/models/user.model.ts
// ============================================================

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { RefreshTokenModel } from './refresh-token.model';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Table({ tableName: 'users', timestamps: true })
export class UserModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @Unique
  @Column({ type: DataType.STRING(255), allowNull: false })
  email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'full_name' })
  fullName: string;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'avatar_url' })
  avatarUrl: string;

  @Default(UserRole.STUDENT)
  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
  })
  role: UserRole;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  // ─── Relation ──────────────────────────────────────────────
  @HasMany(() => RefreshTokenModel)
  refreshTokens: RefreshTokenModel[];
}
