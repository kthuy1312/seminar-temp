import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from '../entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),

    // Cấu hình Multer: disk storage, file filter, size limit
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uploadDir = configService.get<string>('upload.dir', './uploads');

        // Tạo thư mục uploads nếu chưa có
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        return {
          storage: diskStorage({
            destination: uploadDir,
            filename: (_req, file, cb) => {
              // Đặt tên file = UUID + extension gốc → tránh trùng, bảo mật
              const ext = path.extname(file.originalname).toLowerCase();
              const filename = `${uuidv4()}${ext}`;
              cb(null, filename);
            },
          }),
          limits: {
            fileSize: configService.get<number>('upload.maxSize', 10485760), // 10MB
          },
          fileFilter: (_req: any, file: any, cb: any) => {
            const allowedMimes = [
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (allowedMimes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(
                new Error(`Invalid file type: ${file.mimetype}. Only PDF and DOCX are allowed.`),
                false,
              );
            }
          },
        };
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
