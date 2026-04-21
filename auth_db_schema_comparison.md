# Auth Service — Database Schema (Prisma vs Sequelize)

## So sánh 3 ORM

| Tiêu chí | TypeORM (hiện tại) | Prisma | Sequelize |
|----------|-------------------|--------|-----------|
| Schema định nghĩa | Decorator trên class | File `.prisma` riêng | Decorator trên class |
| Migration | CLI generate | `prisma migrate dev` | CLI generate |
| Type-safety | Trung bình | **Cao nhất** (auto-generated types) | Trung bình |
| Query builder | ✅ | ✅ (Prisma Client) | ✅ |
| Learning curve | Trung bình | Thấp | Trung bình |
| NestJS integration | `@nestjs/typeorm` | `@nestjs/prisma` (community) | `@nestjs/sequelize` |

---

## Option 1: Prisma Schema

📁 File: [schema.prisma](file:///c:/Users/LENOVO/Desktop/seminar-nhom13/services/auth-service/prisma/schema.prisma)

```prisma
model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique @db.VarChar(255)
  password  String   @db.VarChar(255)
  fullName  String?  @map("full_name") @db.VarChar(100)
  avatarUrl String?  @map("avatar_url") @db.Text
  role      UserRole @default(student)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  refreshTokens RefreshToken[]
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @db.Text
  expiresAt DateTime @map("expires_at")
  isRevoked Boolean  @default(false) @map("is_revoked")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("refresh_tokens")
}
```

**Chạy Prisma:**
```bash
# Cài đặt
npm install prisma @prisma/client
npx prisma generate      # Tạo Prisma Client (type-safe)
npx prisma migrate dev   # Tạo migration + apply
npx prisma studio        # GUI xem database
```

---

## Option 2: Sequelize Models

📁 Files:
- [user.model.ts](file:///c:/Users/LENOVO/Desktop/seminar-nhom13/services/auth-service/src/models/user.model.ts)
- [refresh-token.model.ts](file:///c:/Users/LENOVO/Desktop/seminar-nhom13/services/auth-service/src/models/refresh-token.model.ts)

**Chạy Sequelize:**
```bash
# Cài đặt
npm install @nestjs/sequelize sequelize sequelize-typescript pg
npm install -D @types/sequelize

# Tích hợp vào app.module.ts
SequelizeModule.forRoot({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'auth_db',
  models: [UserModel, RefreshTokenModel],
  autoLoadModels: true,
  synchronize: true, // chỉ dev
})
```

---

## Field Mapping (DB ↔ Code)

| DB Column (snake_case) | TypeORM | Prisma | Sequelize |
|------------------------|---------|--------|-----------|
| `full_name` | `@Column({ name: 'full_name' })` | `@map("full_name")` | `{ field: 'full_name' }` |
| `avatar_url` | `@Column({ name: 'avatar_url' })` | `@map("avatar_url")` | `{ field: 'avatar_url' }` |
| `user_id` | `@Column({ name: 'user_id' })` | `@map("user_id")` | `{ field: 'user_id' }` |
| `expires_at` | `@Column({ name: 'expires_at' })` | `@map("expires_at")` | `{ field: 'expires_at' }` |
| `is_revoked` | `@Column({ name: 'is_revoked' })` | `@map("is_revoked")` | `{ field: 'is_revoked' }` |
| `created_at` | `@CreateDateColumn({ name: 'created_at' })` | `@map("created_at")` | `{ field: 'created_at' }` |

> [!TIP]
> **Khuyến nghị dùng Prisma** nếu bắt đầu mới — type-safety tốt nhất, migration workflow rõ ràng, `prisma studio` tiện debug. Project hiện tại đang dùng **TypeORM** và hoạt động tốt, không bắt buộc phải chuyển.
