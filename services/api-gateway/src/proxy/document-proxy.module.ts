import { Module } from '@nestjs/common';
import { DocumentProxyController } from './document-proxy.controller';

@Module({
  controllers: [DocumentProxyController],
})
export class DocumentProxyModule {}
