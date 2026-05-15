import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TutorModule } from './tutor/tutor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TutorModule,
  ],
})
export class AppModule {}
