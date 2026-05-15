import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SummaryModule,
  ],
})
export class AppModule {}
