# Cấu hình Consumer RabbitMQ trong NestJS (Summary Service)

Tài liệu này trình bày cách triển khai việc lắng nghe (consume) RabbitMQ Message Queue từ NestJS để tự động tóm tắt văn bản khi một tài liệu được upload (`document.uploaded`).

## 1. Cấu hình Microservice với RabbitMQ (main.ts)
Để một ứng dụng NestJS vừa chạy HTTP (REST API) vừa làm Consumer cho RabbitMQ, ta cần kích hoạt chế độ Hybrid Application trong file `main.ts` bằng `app.connectMicroservice()`.

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Cấu hình RabbitMQ Consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'document_events_queue', // Tên Queue cần lắng nghe
      queueOptions: {
        durable: true, // Giữ lại queue khi RabbitMQ server restart
      },
    },
  });

  // Khởi động các microservices listener trước khi start web server
  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3005;
  await app.listen(port);
  
  logger.log(`Summary Service is running on http://localhost:${port}`);
  logger.log(`Summary Microservice is listening to RabbitMQ`);
}
bootstrap();
```

## 2. Bắt Event bằng Controller (summary.controller.ts)
Microservice Consumer trong NestJS sử dụng decorator `@EventPattern` (kiểu Fire-and-Forget, không cần trả kết quả trực tiếp lại cho người gửi) để bắt Message từ RabbitMQ. 

```typescript
// src/summary/summary.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SummaryService } from './summary.service';

@Controller('api/summaries')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  /**
   * Bắt sự kiện 'document.uploaded' từ RabbitMQ.
   * @Payload là nội dung message được gửi qua queue.
   */
  @EventPattern('document.uploaded')
  async handleDocumentUploadedEvent(@Payload() data: any) {
    console.log('Received event document.uploaded:', data);
    // Chuyển dữ liệu xuống Service để gọi AI xử lý
    await this.summaryService.handleDocumentUploaded(data);
  }
}
```

## 3. Xử lý Logic trong Service (summary.service.ts)
Khi Controller nhận event, nó gọi phương thức `handleDocumentUploaded` của Service để làm nhiệm vụ nghiệp vụ. Logic chuẩn sẽ là:
1. Đọc nội dung file text được truyền qua payload.
2. Nếu không có text, lấy nội dung file từ Document Service qua API.
3. Chuyển nội dung cho Gemini AI Service để tóm tắt.
4. Lưu bản tóm tắt vào cơ sở dữ liệu Prisma.

```typescript
// src/summary/summary.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  // ... Inject PrismaService và AiService ...

  async handleDocumentUploaded(payload: any) {
    const { document_id, extracted_text } = payload;
    
    this.logger.log(`Đang xử lý tóm tắt cho document: ${document_id}`);
    
    // ... logic lấy text (nếu thiếu) ...
    // ... logic gọi this.aiService.summarizeText() ...
    // ... logic lưu DB this.prisma.summary.create() ...
  }
}
```

## Giải thích luồng hoạt động
- **RabbitMQ Queue (`document_events_queue`)** sẽ lưu trữ message với pattern `document.uploaded`.
- NestJS Microservice qua thư viện `@nestjs/microservices` liên tục poll/listen hàng đợi này.
- Khi có message, NestJS tự động route nó tới hàm có `@EventPattern('document.uploaded')` trong `SummaryController`.
- Controller extract data thông qua `@Payload()` và gọi method xử lý bất đồng bộ để gọi Gemini AI. Việc này đảm bảo Microservice phi tập trung, nhận message một cách bất đồng bộ không làm block (chặn) trải nghiệm tải file của người dùng từ đầu API Gateway/Document Service.
