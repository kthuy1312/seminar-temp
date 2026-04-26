import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Tạo kết nối pool cho Postgres
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // 2. Tạo adapter
    const adapter = new PrismaPg(pool);

    // 3. Khởi tạo PrismaClient với adapter
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}