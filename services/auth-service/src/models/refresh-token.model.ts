// ============================================================
// Sequelize Models — Auth Service
// File: services/auth-service/src/models/refresh-token.model.ts
// ============================================================

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  Index,
} from 'sequelize-typescript';
import { UserModel } from './user.model';

@Table({ tableName: 'refresh_tokens', timestamps: false })
export class RefreshTokenModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID })
  id: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false, field: 'user_id' })
  userId: string;

  @Index
  @Column({ type: DataType.TEXT, allowNull: false })
  token: string;

  @Column({ type: DataType.DATE, allowNull: false, field: 'expires_at' })
  expiresAt: Date;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_revoked' })
  isRevoked: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  // ─── Relation ──────────────────────────────────────────────
  @BelongsTo(() => UserModel, { onDelete: 'CASCADE' })
  user: UserModel;
}
