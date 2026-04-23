# Triển khai Function Extract Text (PDF & DOCX)

Tài liệu này trình bày code mẫu và cách thức hoạt động của tính năng trích xuất nội dung văn bản (extract text) từ các file `.pdf` và `.docx`.

## 1. Code Function Extract Text
Dưới đây là một function hoàn chỉnh đáp ứng đúng yêu cầu của bạn: nhận file PDF hoặc DOCX và trả về **chuỗi text thuần túy (string)**.

```typescript
import { readFile } from 'fs/promises';
import { extname } from 'path';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

/**
 * Trích xuất văn bản từ file PDF hoặc DOCX.
 * @param filePath Đường dẫn tuyệt đối tới file cần đọc
 * @param fileName Tên file để lấy extension
 * @returns Chuỗi văn bản (text string) được trích xuất
 */
export async function extractTextString(filePath: string, fileName: string): Promise<string> {
  const ext = extname(fileName).toLowerCase();
  let buffer: Buffer;

  try {
    buffer = await readFile(filePath);
  } catch (error) {
    throw new Error(`Không thể đọc file tại đường dẫn: ${filePath}`);
  }

  // 1. Trích xuất PDF -> pdf-parse
  if (ext === '.pdf') {
    try {
      const pdfData = await pdfParse(buffer, { pagerender: undefined });
      return pdfData.text; // Trả về nội dung text string
    } catch (error) {
      throw new Error('Lỗi khi parse file PDF bằng pdf-parse');
    }
  } 
  // 2. Trích xuất DOCX -> mammoth
  else if (ext === '.docx') {
    try {
      const docxData = await mammoth.extractRawText({ buffer });
      return docxData.value; // Trả về nội dung text string
    } catch (error) {
      throw new Error('Lỗi khi parse file DOCX bằng mammoth');
    }
  } 
  // 3. Xử lý các định dạng không hỗ trợ
  else {
    throw new Error(`Không hỗ trợ trích xuất văn bản từ định dạng: ${ext}`);
  }
}
```

## 2. Giải thích thư viện được sử dụng

- **`pdf-parse` (`npm i pdf-parse`)**: 
  - Là thư viện mạnh mẽ để đọc nội dung text bên trong PDF.
  - Sử dụng hàm `pdfParse(buffer)` để đọc toàn bộ các trang PDF và lấy trường `.text` trong object trả về. Option `pagerender: undefined` giúp tối ưu hiệu năng vì chúng ta chỉ cần raw text chứ không cần render cấu trúc trang.
  - *Lưu ý:* Thư viện này không hỗ trợ đọc chữ trên file ảnh PDF (scanned image). Để làm vậy bạn sẽ cần tích hợp thêm Tesseract OCR.

- **`mammoth` (`npm i mammoth`)**:
  - Mammoth tập trung đọc nội dung file `.docx` sang HTML/Text mà bỏ qua những định dạng rác.
  - Gọi phương thức `mammoth.extractRawText({ buffer })` sẽ bỏ qua style (in đậm, màu chữ...) và chỉ lấy dữ liệu `.value` dạng chuỗi (text string), rất phù hợp để gửi tới AI Service cho mục đích tóm tắt.

## 3. Ứng dụng trong Project hiện tại
Trong microservice của bạn (`document-service`), tính năng này đã được xây dựng sẵn thành một class Service nâng cao nằm tại đường dẫn: `src/documents/text-extractor.service.ts`. Phiên bản service hiện tại thực hiện thêm 1 số tối ưu như:
- Trim và xóa bỏ các ký tự control (rác) thừa.
- Trả về đối tượng (object) kèm theo metadata (như số chữ, số dòng).
- Báo lỗi qua `UnprocessableEntityException` chuẩn NestJS.

Bạn hoàn toàn có thể sử dụng lại logic của `TextExtractorService` hoặc cập nhật code hàm hiện tại để chỉ `return string` như mong muốn ở trên.
