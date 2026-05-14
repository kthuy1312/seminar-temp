# User Stories - AI Study Assistant

## Phạm vi

Tài liệu này tổng hợp user story dựa trên các yêu cầu trong `Requirement.pdf`, bao phủ các module:
- Goal Setting
- Smart Roadmap
- Document Upload & Processing
- AI Tutor (Chat)
- Auto Quiz/Flashcard
- Learning Performance Assessment
- Progress Dashboard

---

## EPIC 1 - Goal Setting (Nhập/Cập nhật mục tiêu học tập)

### US-01 - Thiết lập mục tiêu học tập lần đầu
**Là** một học sinh,  
**tôi muốn** nhập mục tiêu điểm, trình độ hiện tại, thời gian học và môn học,  
**để** hệ thống cá nhân hóa lộ trình học phù hợp.

**Acceptance Criteria**
- Người dùng lần đầu truy cập thấy form gồm: mục tiêu điểm, trình độ, thời gian học, môn học.
- Bắt buộc nhập đủ các trường trước khi xác nhận.
- Khi dữ liệu hợp lệ, hệ thống lưu thành công vào cơ sở dữ liệu.
- Sau khi lưu, hệ thống gửi dữ liệu sang AI để phân tích.
- Hệ thống hiển thị trạng thái thành công cho người dùng.

### US-02 - Cập nhật mục tiêu học tập
**Là** một học sinh,  
**tôi muốn** chỉnh sửa mục tiêu học tập đã khai báo,  
**để** lộ trình học được cập nhật theo tình hình mới.

**Acceptance Criteria**
- Người dùng xem được thông tin mục tiêu hiện tại.
- Người dùng có thể thay đổi một hoặc nhiều trường mục tiêu.
- Nếu không có thay đổi, hệ thống thông báo không cần cập nhật.
- Khi cập nhật hợp lệ, hệ thống lưu dữ liệu mới và gửi lại cho AI phân tích.
- Kết quả cập nhật được hiển thị rõ ràng.

### US-03 - Xử lý lỗi khi lưu hoặc phân tích AI mục tiêu
**Là** một học sinh,  
**tôi muốn** nhận thông báo rõ ràng khi có lỗi,  
**để** biết cách tiếp tục thao tác.

**Acceptance Criteria**
- Nếu lưu DB thất bại, hệ thống thông báo lỗi lưu dữ liệu.
- Nếu AI không phản hồi, hệ thống vẫn giữ dữ liệu đã lưu.
- Khi AI lỗi, hệ thống đánh dấu phân tích lại sau và không mất dữ liệu người dùng.

---

## EPIC 2 - Smart Learning Roadmap (Tạo lộ trình học tập thông minh)

### US-04 - Tạo lộ trình học tự động
**Là** một học sinh,  
**tôi muốn** hệ thống tự tạo lộ trình theo mục tiêu và trình độ,  
**để** biết cần học gì theo từng giai đoạn.

**Acceptance Criteria**
- Hệ thống nhận dữ liệu mục tiêu, trình độ, thời gian học của người dùng.
- AI phân tích mức ưu tiên từng môn.
- Hệ thống phân bổ thời gian học theo ngày/tuần/tháng.
- Lộ trình được hiển thị trực quan cho người dùng.
- Thời gian tạo lộ trình đáp ứng mục tiêu hiệu năng (<= 3-5 giây trong điều kiện bình thường).

### US-05 - Điều chỉnh lộ trình khi thay đổi mục tiêu/tiến độ
**Là** một học sinh,  
**tôi muốn** lộ trình được tự cập nhật khi tôi đổi mục tiêu hoặc học nhanh/chậm hơn,  
**để** kế hoạch học luôn sát thực tế.

**Acceptance Criteria**
- Khi mục tiêu thay đổi, hệ thống tự động sinh lại lộ trình phù hợp.
- Khi tiến độ thực tế lệch so với kế hoạch, AI đề xuất điều chỉnh.
- Dữ liệu lộ trình cũ và mới được lưu để theo dõi.

### US-06 - Xử lý thiếu dữ liệu đầu vào cho lộ trình
**Là** một học sinh,  
**tôi muốn** hệ thống hướng dẫn khi dữ liệu chưa đủ,  
**để** có thể hoàn thiện thông tin và tiếp tục.

**Acceptance Criteria**
- Nếu thiếu mục tiêu hoặc thời gian học, hệ thống yêu cầu nhập lại.
- Nếu thiếu dữ liệu đánh giá trình độ, hệ thống dùng mức mặc định "trung bình" hoặc yêu cầu kiểm tra đầu vào.

---

## EPIC 3 - Document Upload & Processing (Upload và xử lý tài liệu)

### US-07 - Upload tài liệu học tập
**Là** một học sinh,  
**tôi muốn** tải lên tài liệu (PDF, DOCX, PPT),  
**để** hệ thống dùng tài liệu đó cho tóm tắt, AI Tutor và luyện tập.

**Acceptance Criteria**
- Người dùng truy cập màn hình tài liệu và chọn file từ thiết bị.
- Chỉ chấp nhận định dạng được hỗ trợ (PDF, DOCX, PPT theo yêu cầu).
- Hệ thống kiểm tra tính hợp lệ file trước khi lưu.
- File hợp lệ được lưu thành công.
- Người dùng nhận thông báo upload thành công.

### US-08 - Trích xuất và phân tích nội dung tài liệu bằng AI
**Là** một học sinh,  
**tôi muốn** tài liệu được trích xuất nội dung chính tự động,  
**để** có dữ liệu học tập dùng lại cho các tính năng AI.

**Acceptance Criteria**
- Sau upload, hệ thống gửi tài liệu sang AI xử lý.
- AI phân tích và trích xuất thông tin quan trọng.
- Kết quả phân tích được lưu để tái sử dụng ở các module khác.
- Hệ thống hiển thị trạng thái xử lý cho người dùng.

### US-09 - Xử lý lỗi file và lỗi phân tích tài liệu
**Là** một học sinh,  
**tôi muốn** biết rõ nguyên nhân khi upload hoặc xử lý thất bại,  
**để** có thể sửa tài liệu và thử lại.

**Acceptance Criteria**
- Nếu file sai định dạng/hỏng, hệ thống thông báo lỗi và yêu cầu chọn lại.
- Nếu AI không đọc được nội dung, hệ thống thông báo cần kiểm tra tài liệu.

---

## EPIC 4 - AI Tutor (Hỏi đáp thông minh)

### US-10 - Hỏi đáp với AI qua giao diện chat
**Là** một học sinh,  
**tôi muốn** đặt câu hỏi tự nhiên cho AI Tutor,  
**để** được giải thích kiến thức như gia sư cá nhân.

**Acceptance Criteria**
- Hệ thống có giao diện chat gửi/nhận tin nhắn liên tục.
- Người dùng nhập câu hỏi ngôn ngữ tự nhiên.
- Hệ thống hiển thị trạng thái "AI is typing..." khi đang xử lý.
- AI trả lời dựa trên tài liệu liên quan và kiến thức mô hình.
- Thời gian phản hồi đáp ứng mục tiêu <= 5 giây trong điều kiện bình thường.

### US-11 - Gợi ý câu hỏi mẫu để bắt đầu học
**Là** một học sinh,  
**tôi muốn** xem và chọn câu hỏi gợi ý,  
**để** tương tác nhanh khi chưa biết hỏi gì.

**Acceptance Criteria**
- Hệ thống hiển thị danh sách câu hỏi mẫu theo ngữ cảnh học.
- Khi người dùng chọn câu hỏi gợi ý, hệ thống tự gửi và xử lý như câu hỏi thường.

### US-12 - Lưu và tiếp tục lịch sử hội thoại
**Là** một học sinh,  
**tôi muốn** lưu lịch sử chat theo phiên và mở lại bất cứ lúc nào,  
**để** không mất ngữ cảnh học tập.

**Acceptance Criteria**
- Tất cả tin nhắn user/AI được lưu theo session.
- Người dùng xem lại lịch sử hội thoại cũ.
- Người dùng tiếp tục chat trên phiên cũ mà không cần tạo lại từ đầu.
- Dữ liệu hội thoại vẫn tồn tại sau khi refresh trang.

### US-13 - Fallback khi không có tài liệu liên quan hoặc AI lỗi
**Là** một học sinh,  
**tôi muốn** hệ thống vẫn phản hồi trong các trường hợp thiếu dữ liệu,  
**để** trải nghiệm học không bị gián đoạn.

**Acceptance Criteria**
- Nếu không tìm thấy tài liệu liên quan, AI trả lời bằng kiến thức tổng quát và thông báo mức liên quan thấp.
- Nếu lỗi truy xuất vector database, hệ thống fallback theo cơ chế dự phòng.
- Nếu lỗi kết nối AI service, hệ thống thông báo thử lại rõ ràng.

---

## EPIC 5 - Auto Exercise Generation (Sinh bài tập/câu hỏi tự động)

### US-14 - Sinh bài luyện tập từ tài liệu/lộ trình
**Là** một học sinh,  
**tôi muốn** hệ thống tự sinh quiz/flashcard,  
**để** luyện tập theo đúng nội dung đang học.

**Acceptance Criteria**
- Hệ thống lấy ngữ cảnh từ tài liệu đã upload hoặc lộ trình học.
- AI sinh bộ câu hỏi trắc nghiệm và/hoặc flashcard.
- Câu hỏi hiển thị ban đầu không lộ đáp án đúng.
- Thời gian sinh bài đáp ứng mục tiêu < 5 giây trong điều kiện bình thường.

### US-15 - Làm bài, xem đáp án giải thích và nhận điểm
**Là** một học sinh,  
**tôi muốn** chọn đáp án và xem giải thích sau khi trả lời,  
**để** hiểu lỗi sai và cải thiện kết quả.

**Acceptance Criteria**
- Người dùng chọn đáp án cho từng câu hỏi.
- Sau khi trả lời, hệ thống hiển thị đáp án đúng và giải thích.
- Khi hoàn thành bài, hệ thống chấm điểm chính xác.
- Kết quả cuối hiển thị đầy đủ: đúng/sai, điểm số.

### US-16 - Xử lý lỗi khi AI không sinh được bài tập
**Là** một học sinh,  
**tôi muốn** nhận thông báo khi hệ thống không tạo được bài,  
**để** biết cần thử lại.

**Acceptance Criteria**
- Nếu AI không phản hồi, hệ thống thông báo lỗi và cho phép thử lại.

---

## EPIC 6 - Learning Performance Assessment (Đánh giá năng lực học tập)

### US-17 - Đánh giá năng lực tổng thể dựa trên dữ liệu học
**Là** một học sinh,  
**tôi muốn** nhận đánh giá năng lực theo dữ liệu thực học,  
**để** biết điểm mạnh, điểm yếu và mức độ hiện tại.

**Acceptance Criteria**
- Hệ thống thu thập dữ liệu từ kết quả quiz, lịch sử học, tiến độ học.
- Dữ liệu được tổng hợp theo môn học và thời gian.
- AI phân tích và đưa ra đánh giá tổng quan (yếu/trung bình/khá/tốt).
- Kết quả hiển thị gồm điểm mạnh, điểm yếu, mức độ học tập tổng thể.

### US-18 - Nhận gợi ý cải thiện cá nhân hóa
**Là** một học sinh,  
**tôi muốn** nhận đề xuất học tập cụ thể,  
**để** tập trung đúng môn và nội dung cần cải thiện.

**Acceptance Criteria**
- Hệ thống đề xuất môn cần tập trung.
- Hệ thống đề xuất nội dung cần ôn lại.
- Hệ thống đề xuất bài tập bổ sung phù hợp.

### US-19 - Lưu lịch sử đánh giá theo thời gian
**Là** một học sinh,  
**tôi muốn** theo dõi các lần đánh giá trước đây,  
**để** thấy được sự tiến bộ dài hạn.

**Acceptance Criteria**
- Mỗi kết quả đánh giá được lưu theo mốc thời gian.
- Người dùng xem lại lịch sử đánh giá qua nhiều giai đoạn.

### US-20 - Đánh giá khi dữ liệu thiếu/không đồng nhất
**Là** một học sinh,  
**tôi muốn** hệ thống vẫn đưa ra đánh giá hợp lý dù dữ liệu chưa hoàn hảo,  
**để** vẫn có định hướng học tập.

**Acceptance Criteria**
- Nếu dữ liệu thiếu, hệ thống thông báo mức độ tin cậy và đưa đánh giá sơ bộ.
- Nếu dữ liệu không đồng nhất, hệ thống chỉ phân tích phần hợp lệ và bỏ qua dữ liệu lỗi.
- Nếu lỗi truy xuất dữ liệu hoặc lỗi AI service, hệ thống thông báo rõ ràng và có phương án dự phòng.

---

## EPIC 7 - Progress Dashboard (Theo dõi tiến độ học tập)

### US-21 - Xem tổng quan tiến độ học tập
**Là** một học sinh,  
**tôi muốn** xem dashboard tiến độ theo thời gian thực,  
**để** nắm được mức độ hoàn thành mục tiêu.

**Acceptance Criteria**
- Dashboard hiển thị: tiến độ (%), thời gian học, mức hoàn thành mục tiêu, lịch sử học.
- Dữ liệu được trình bày bằng biểu đồ trực quan.
- Dữ liệu được cập nhật định kỳ/theo thời gian.
- Thời gian hiển thị đáp ứng mục tiêu < 2 giây trong thao tác cơ bản.

### US-22 - Thông báo khi chưa có dữ liệu học tập
**Là** một học sinh mới,  
**tôi muốn** thấy thông báo phù hợp khi chưa có dữ liệu,  
**để** hiểu vì sao dashboard chưa hiển thị số liệu.

**Acceptance Criteria**
- Nếu chưa có dữ liệu học tập, hệ thống hiển thị trạng thái "Chưa có dữ liệu".

---

## User Stories Phi chức năng (NFR) áp dụng toàn hệ thống

### US-NFR-01 - Hiệu năng
**Là** người dùng,  
**tôi muốn** phản hồi nhanh,  
**để** trải nghiệm học tập không bị gián đoạn.

**Acceptance Criteria**
- Các thao tác cơ bản phản hồi nhanh theo ngưỡng đã nêu trong từng module.
- Hệ thống đáp ứng đồng thời nhiều request người dùng.

### US-NFR-02 - Bảo mật dữ liệu học tập
**Là** người dùng,  
**tôi muốn** dữ liệu cá nhân và học tập được bảo vệ,  
**để** chỉ tôi mới xem được thông tin của mình.

**Acceptance Criteria**
- Dữ liệu tài khoản, tài liệu, hội thoại, kết quả học chỉ chủ sở hữu được truy cập.
- Hệ thống ngăn truy cập trái phép bằng cơ chế xác thực/phân quyền.

### US-NFR-03 - Khả năng mở rộng
**Là** chủ hệ thống,  
**tôi muốn** hệ thống mở rộng khi số lượng người dùng tăng,  
**để** duy trì chất lượng dịch vụ ổn định.

**Acceptance Criteria**
- Hệ thống xử lý được nhiều người dùng đồng thời.
- Có khả năng tích hợp thêm môn học và AI model mới.

### US-NFR-04 - Tính dễ sử dụng
**Là** học sinh,  
**tôi muốn** giao diện đơn giản, trực quan,  
**để** sử dụng dễ dàng mà không cần kiến thức kỹ thuật.

**Acceptance Criteria**
- Các màn hình chính có bố cục rõ ràng, dễ thao tác.
- Biểu đồ/dashboard/chat hiển thị trực quan, dễ hiểu.

---

## Gợi ý ưu tiên triển khai (Backlog Priority)

1. **P0 (bắt buộc cho MVP):** US-01, US-02, US-04, US-07, US-10, US-14, US-15, US-21  
2. **P1 (mở rộng cốt lõi):** US-08, US-12, US-17, US-18, US-19  
3. **P2 (nâng cao/độ bền vững):** US-03, US-06, US-09, US-13, US-16, US-20, US-22, nhóm NFR

