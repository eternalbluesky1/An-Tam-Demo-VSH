# An Tâm - Máy tính Dự toán Chi phí Điều trị Ung thư

Prototype cho HackAIThon 2026 - Đề tài 4: Y tế thông minh

## Tổng quan

Đây là nguyên mẫu hoạt động của Máy tính Tài chính, thành phần cốt lõi trong hệ thống An Tâm. Engine tính toán sử dụng dữ liệu thực tế từ các văn bản pháp quy y tế Việt Nam để ước tính chi phí điều trị ung thư, bao gồm tỷ lệ chi trả BHYT theo từng loại thuốc, từng hạng bệnh viện.

## Tính năng chính

- Ước tính chi phí điều trị dựa trên loại ung thư, giai đoạn, thẻ BHYT, hạng bệnh viện và tuyến khám
- Tính tỷ lệ BHYT theo Quy tắc 62 bệnh (QĐ-BYT): bệnh nhân ung thư tại tuyến chuyên sâu đúng tuyến được hưởng 100% chi phí dịch vụ
- Tỷ lệ BHYT theo từng loại thuốc từ Phụ lục I, Mục 14 - Thông tư 20/2022/TT-BYT: hóa trị 50%, nội tiết 80%, đích 50%, miễn dịch 0% (chưa trong danh mục)
- Xử lý các mục không được BHYT thanh toán: PET/CT, xét nghiệm phân tử, liệu pháp miễn dịch
- Dự phóng theo thời gian: phân bổ chi phí theo tuần, tháng, quý
- Chi phí phát sinh trong điều trị: đi lại, ăn uống, chỗ ở cho bệnh nhân và người nhà

## Loại ung thư được hỗ trợ

| Mã | Loại ung thư |
|----|-------------|
| C50 | Ung thư vú |
| C34 | Ung thư phổi |
| C20 | Ung thư đại tràng |
| C22 | Ung thư gan |
| C16 | Ung thư dạ dày |
| C73 | Ung thư tuyến giáp |
| C61 | Ung thư tuyến tiền liệt |

## Nguồn dữ liệu

| Loại dữ liệu | Nguồn |
|--------------|-------|
| Giá dịch vụ | QĐ3222/QĐ-BYT (Bệnh viện Chợ Rẫy) |
| Danh mục thuốc BHYT | Phụ lục I, Mục 14 - Thông tư 20/2022/TT-BYT + TT 37/2024 |
| Quy tắc BHYT | Luật BHYT, 62 bệnh ưu tiên tuyến chuyên sâu |
| Phác đồ điều trị | NCCN guidelines, thích ứng cho bối cảnh Việt Nam |

## Cách chạy demo

Mở index.html trong trình duyệt. Không cần bước build.

## Cách chạy test

```
node --test cost-model.test.js
```

44 test cases bao gồm:

- Smoke test cho tất cả 7 loại ung thư x 4 giai đoạn
- Kiểm tra quy tắc 62 bệnh (tuyến chuyên sâu đúng tuyến = 100% chi phí dịch vụ)
- Tỷ lệ BHYT theo từng loại thuốc (miễn dịch = 0%, đích = 50%, nội tiết = 80%)
- Xử lý dữ liệu đầu vào không hợp lệ
- Kiểm tra tính hợp lý của chi phí (ung thư vú giai đoạn 1: 20-200 triệu VND, giai đoạn 4: 500 triệu-3 tỷ VND)

## Kiến trúc

```
+-----------------------------------------------+
|  Giao diện Bệnh nhân (index.html + app.js)    |
|  Mobile-first, voice-first, chế độ dễ dùng    |
+-----------------------------------------------+
|  Engine Tính toán (cost-model.js)             |
|  Xác định, rule-based, không dùng LLM         |
|  Phác đồ ung thư x Quy tắc BHYT x Giá        |
+-----------------------------------------------+
|  Tầng Dữ liệu                                 |
|  Giá QĐ3222, danh mục thuốc, hạng BV         |
+-----------------------------------------------+
```

## Các quyết định thiết kế

1. Xác định, không phải xác suất. Chi phí được tính bằng quy tắc cố định, không suy luận bằng LLM. Tầng LLM (dự kiến phát triển ở Vòng 2) xử lý ngôn ngữ tự nhiên, engine tính toán xử lý toán học.

2. Tỷ lệ BHYT theo từng loại thuốc. Hầu hết giải pháp hiện có dùng tỷ lệ phần trăm chung chung. An Tâm dùng danh mục thực tế: hóa trị 50%, nội tiết 80%, đích 50%, miễn dịch 0% (chưa trong danh mục BHYT).

3. Quy tắc 62 bệnh. Bệnh nhân ung thư tại tuyến chuyên sâu được hưởng 100% chi phí dịch vụ, nhưng thuốc vẫn có tỷ lệ riêng. Phân biệt này quan trọng và hầu hết công cụ hiện có tính sai.

## Đội ngũ

- Đặng Đức An - Backend, Kiến trúc AI
- Bùi Trí Anh Phát - Frontend, Thiết kế UX

Đại học Fulbright Việt Nam, Tháng 6/2026
