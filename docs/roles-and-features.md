# Danh sách role & chức năng (thực tế phòng khám VN)

Tài liệu mô tả role chính và chức năng theo từng vai trò trong hệ thống Luồng bệnh nhân & Phân loại ưu tiên.

---

## 1. ADMIN – Quản trị hệ thống (IT / chủ phòng khám)

**👉 Không đụng bệnh nhân, quản lý toàn hệ thống.**

### Chức năng chính

- Quản lý tenant (phòng khám / chi nhánh)
- Quản lý người dùng (user)
- Gán role cho user
- Quản lý cấu hình hệ thống
- Quản lý AI model (audit, version)
- Xem báo cáo tổng hợp

### Chi tiết chức năng

**Người dùng & phân quyền**

- Tạo / khóa / mở tài khoản nhân viên
- Gán role: Receptionist, Triage Nurse, Doctor
- Phân quyền theo chi nhánh

**Cấu hình phòng khám**

- Thời gian làm việc
- Các hàng chờ (queue)
- Luồng khám

**AI (enterprise)**

- Xem model AI đang dùng
- Xem lịch sử AI decision
- So sánh: AI đề xuất vs quyết định con người
- Bật / tắt AI theo chi nhánh

**📌 Điểm ăn tiền CV:** AI Audit + Explainability

---

## 2. RECEPTIONIST – Lễ tân (điểm tiếp xúc đầu tiên)

**👉 Vai trò cực kỳ quan trọng trong thực tế VN.**

### Mục tiêu

- Tiếp nhận bệnh nhân
- Giảm tắc nghẽn
- Không cần kiến thức y khoa

### Chức năng

**Tiếp nhận bệnh nhân**

- Tìm bệnh nhân bằng: CCCD, SĐT
- Tạo bệnh nhân mới (nếu chưa có)
- Đặt lịch / check-in
  - Tạo lịch hẹn
  - Check-in bệnh nhân đến khám
- Walk-in (không đặt lịch trước)

**Quản lý luồng**

- Gửi bệnh nhân sang Triage Nurse
- Xem trạng thái: Đã chờ, Đang phân loại, Đang khám

**📌 Lễ tân KHÔNG quyết định ưu tiên.**

---

## 3. TRIAGE NURSE – Y tá phân loại (CORE của dự án)

**🔥 Đây là linh hồn của đồ án.**

### Mục tiêu

- Phân loại bệnh nhân
- Xác định mức độ ưu tiên
- Là nơi AI can thiệp

### Chức năng

**Thu thập thông tin**

- Lý do đến khám (triệu chứng)
- Sinh hiệu: Mạch, Huyết áp, SpO₂, Nhiệt độ
- Tiền sử cơ bản

**AI hỗ trợ phân loại**

- Gửi dữ liệu cho AI
- Nhận: Mức độ nguy cấp (acuity), Độ tin cậy
- AI giải thích ngắn gọn (vd: "SpO₂ thấp + đau ngực → nguy cơ cao")

**Quyết định cuối**

- Chấp nhận AI hoặc override bằng con người
- Ghi lý do override
- Đưa bệnh nhân vào hàng chờ **theo mức độ ưu tiên** (không theo thứ tự đến trước)

**📌 AI không thay người – AI hỗ trợ người.**

---

## 4. DOCTOR – Bác sĩ (người ra quyết định y khoa)

### Mục tiêu

- Khám nhanh
- Không bị quá tải
- Thấy bệnh nhân nặng trước

### Chức năng

**Dashboard bác sĩ**

- Danh sách bệnh nhân chờ khám
- Sắp xếp theo: Mức độ nguy cấp, Thời gian chờ
- Xem trước hồ sơ: Lý do đến khám, Sinh hiệu, Kết quả AI triage

**Khám bệnh**

- Ghi chẩn đoán
- Ghi chỉ định (text)
- Kết thúc lượt khám

**📌 Bác sĩ KHÔNG cần nhập lại dữ liệu đã có.**

---

## 5. CLINIC MANAGER – Quản lý vận hành (Optional – nâng cấp)

**👉 Role này giúp đồ án "đội trình".**

### Chức năng

- Xem báo cáo:
  - Thời gian chờ trung bình
  - Số bệnh nhân/ngày
- So sánh: Trước khi có AI vs Sau khi có AI
- Đánh giá hiệu quả nhân sự

---

## Tóm tắt so sánh

| Role            | Tiếp nhận BN | Phân loại / AI | Hàng chờ        | Cấu hình / Báo cáo |
|-----------------|-------------|----------------|-----------------|---------------------|
| **Admin**       | —           | AI audit       | Cấu hình queue | Tenant, user, role  |
| **Receptionist**| ✅ Tìm, đăng ký, check-in, walk-in | — | Xem trạng thái  | —                   |
| **Triage Nurse**| Tìm (phục vụ phân loại) | ✅ Thu thập + AI + override | ✅ Thêm theo ưu tiên | — |
| **Doctor**      | Xem hồ sơ   | Xem kết quả    | ✅ Danh sách chờ, gọi số | —        |
| **Clinic Manager** | —        | —             | —              | ✅ Báo cáo, so sánh AI |
