import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from './documents/documents.module';
import { Document } from './entities/document.entity';
import configuration from './config/configuration';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // PostgreSQL connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [Document],
        synchronize: configService.get<string>('nodeEnv') === 'development', // Chỉ dùng trong dev
        logging: configService.get<string>('nodeEnv') === 'development',
      }),
    }),

    // Feature modules
    DocumentsModule,
  ],
})
export class AppModule {}
