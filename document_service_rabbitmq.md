# 🐰 Message Broker — RabbitMQ Publish Event

> **Service:** `document-service`

---

## 🎯 Tổng quan

Cập nhật `Document Service` tích hợp với hệ thống Message Broker (RabbitMQ) thông qua `@nestjs/microservices`. Sau khi document được upload và text được extract tự động, hệ thống sẽ publish event `document.uploaded` với payload cần thiết để các dịch vụ khác (như hệ thống Search hoặc AI indexing) có thể consume và xử lý bất đồng bộ.

---

## 📂 Các file đã thay đổi

| File | Thay đổi |
|------|----------|
| `src/documents/documents.module.ts` | Đăng ký `ClientsModule` để tạo `RABBITMQ_CLIENT` provider. |
| `src/documents/documents.service.ts` | Inject `RABBITMQ_CLIENT` và publish event `document.uploaded` sau khi tạo Document. |
| `package.json` | Cài đặt thư viện `@nestjs/microservices`, `amqplib`, `amqp-connection-manager`. |

---

## 🛠 Cấu hình RabbitMQ

`ClientsModule.register` được cấu hình với các tham số:
- **Transport:** `Transport.RMQ`
- **URL:** Đọc từ biến môi trường `RABBITMQ_URL` hoặc fallback về `amqp://localhost:5672`.
- **Queue:** `document_events_queue`.
- **Queue Options:** `durable: true` (Đảm bảo message không bị mất khi RabbitMQ restart).

---

## 📤 Payload của Event

Khi sự kiện **`document.uploaded`** được bắn đi, cấu trúc payload bao gồm:

```json
{
  "document_id": "uuid-của-document-được-lưu-trong-DB",
  "extracted_text": "Nội dung text đã được extract từ tài liệu..."
}
```

> **Lưu ý**: Nếu quá trình extract nội dung thất bại, giá trị `extracted_text` có thể sẽ là `null`. Consumer của queue cần xử lý trường hợp này nếu cần thiết.

---

## 📌 Cách Test & Kiểm tra

1. Đảm bảo bạn đang chạy một instance RabbitMQ cục bộ (có thể dùng Docker):
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

2. Cài đặt các dependencies mới (nếu chưa):
   ```bash
   cd services/document-service
   npm install
   ```

3. Gửi request upload file như bình thường:
   ```bash
   curl -X POST http://localhost:3004/api/documents/upload \
     -F "file=@./sample.pdf"
   ```

4. Truy cập giao diện quản lý của RabbitMQ (thường là `http://localhost:15672` với tài khoản `guest` / `guest`). Ở tab **Queues**, bạn sẽ thấy queue `document_events_queue` và số lượng message tăng lên. Bạn cũng có thể xem log của NestJS:
   ```
   [Nest] 12345  - mm/dd/yyyy, hh:mm:ss AM     LOG [DocumentsService] Published event 'document.uploaded' for document: <uuid>
   ```
