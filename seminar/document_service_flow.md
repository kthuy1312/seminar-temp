# 🌊 Luồng Hoạt Động Của Document Service (Flow)

> **Service:** `document-service`  
> **API:** `POST /api/documents/upload`

Dưới đây là mô tả chi tiết từng bước (step-by-step) diễn ra khi một người dùng (User) thực hiện tải lên một tài liệu.

---

## 🚀 Step-by-Step Flow

### 1️⃣ User Upload File
- Người dùng gửi một HTTP POST request tới API `/api/documents/upload`.
- Dữ liệu được gửi dưới dạng `multipart/form-data`, bao gồm:
  - Trường `file`: Chứa file binary (bắt buộc phải là `.pdf` hoặc `.docx`, tối đa 10 MB).
  - Trường `userId` (tùy chọn): Định danh của người tải lên.
- **Tại NestJS:** 
  - `FileInterceptor` (được bọc bởi `Multer`) sẽ đón lấy request này trước khi đi vào controller.
  - Hàm `fileFilter` sẽ kiểm tra extension của file và MIME type. Nếu file không hợp lệ, request sẽ bị từ chối với mã lỗi `415 Unsupported Media Type` ngay lập tức.
  - Kích thước file cũng được kiểm tra. Nếu lớn hơn giới hạn, Multer sẽ quăng lỗi và filter sẽ trả về mã `413 Payload Too Large`.

### 2️⃣ Lưu File (Save File to Disk)
- Nếu file vượt qua các vòng kiểm tra hợp lệ của Multer, cấu hình `diskStorage` sẽ được kích hoạt.
- **Hành động:** 
  - Đổi tên file thành định dạng `[UUID].[extension_gốc]` (ví dụ: `550e8400-e29b-41d4-a716-446655440000.pdf`) để đảm bảo không bị trùng lặp tên.
  - File vật lý được lưu thành công vào thư mục `uploads/` trên máy chủ cục bộ.

### 3️⃣ Extract Text (Trích xuất văn bản)
- Request tiếp tục đi vào hàm `upload` trong `DocumentsService`.
- **Hành động:** 
  - Controller gọi `TextExtractorService` truyền vào đường dẫn vật lý của file vừa lưu.
  - Phân nhánh tùy định dạng file:
    - **Nếu là PDF:** Dùng package `pdf-parse` để đọc buffer của file, bóc tách các text layer.
    - **Nếu là DOCX:** Dùng package `mammoth` để đọc buffer và trích xuất raw text (bỏ qua mọi định dạng như in đậm, màu chữ).
  - Nội dung text sau khi bóc tách sẽ đi qua một bộ chuẩn hóa (cleanText): Xóa các ký tự ẩn (control characters), thu gọn các khoảng trắng và dòng trắng dư thừa để kết quả trả về là một đoạn văn bản thuần sạch sẽ (clean plain text).
  - *Lưu ý:* Quá trình này được đặt trong khối `try...catch`. Nếu có lỗi xảy ra (ví dụ PDF chỉ là một bức ảnh không chứa text layer), tiến trình sẽ không dừng lại (không ném Exception làm hỏng request) mà chỉ ghi lại cảnh báo vào Log và để giá trị biến text bằng `null`.

### 4️⃣ Lưu DB (Save to Database)
- Sau khi quá trình trích xuất kết thúc, service sẽ chuẩn bị dữ liệu để lưu xuống CSDL PostgreSQL thông qua Prisma.
- **Hành động:**
  - Lệnh `prisma.document.create` được gọi với Payload bao gồm:
    - `fileName`: Tên gốc ban đầu của file mà user upload.
    - `fileType`: Loại file (pdf hoặc docx).
    - `filePath`: Đường dẫn vật lý tuyệt đối trên disk.
    - `fileSize`: Dung lượng file theo dạng bytes (lưu trữ dưới kiểu `BigInt`).
    - `extractedText`: Văn bản thuần (plain text) được trích xuất từ Bước 3 (hoặc `null` nếu bóc tách thất bại).
    - `userId`: UUID của user thực hiện thao tác (nếu có).
  - Khi bản ghi được tạo thành công, database sẽ tự sinh ra `id` cho bản ghi tài liệu đó và cột `uploadedAt` với timestamp hiện tại.

### 5️⃣ Emit Event (Phát sóng sự kiện qua RabbitMQ)
- Khi dữ liệu tài liệu đã nằm an toàn trong cơ sở dữ liệu, một sự kiện message broker được kích hoạt để thông báo cho các Microservices khác trong hệ thống.
- **Hành động:**
  - Dùng `RABBITMQ_CLIENT` (`ClientProxy` của NestJS) để gửi message tới queue `document_events_queue`.
  - Sự kiện có tên định danh: **`document.uploaded`**
  - Payload đi kèm gồm 2 thông tin quan trọng nhất:
    ```json
    {
      "document_id": "UUID-của-tài-liệu-vừa-lưu",
      "extracted_text": "Toàn bộ nội dung văn bản thuần vừa trích xuất"
    }
    ```
  - Nhờ vậy, các service khác (ví dụ như: AI Study Assistant Service dùng làm ngữ cảnh học tập, hoặc Search Service dùng để đánh chỉ mục ElasticSearch) có thể nhận biết và tiếp tục các tác vụ nghiệp vụ một cách bất đồng bộ mà không làm chặn luồng phản hồi cho User.

---

### 🏁 Kết quả phản hồi cho User
Hoàn tất chuỗi 5 bước trên, Controller sẽ trả lại mã `201 Created` cho User kèm theo Response dạng chuẩn (qua `TransformInterceptor`), trong đó bao gồm ID của tài liệu, các metadata cơ bản và một đường link (URL) để User có thể bấm vào để xem/tải lại file.
