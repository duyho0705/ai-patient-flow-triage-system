# Phân tích Role & Chức năng hệ thống Sống Khỏe (CDM)

Hệ thống Sống Khỏe tập trung vào Quản lý bệnh mãn tính (Chronic Disease Management - CDM), được thiết kế xoay quanh 4 vai trò chính để đảm bảo quy trình chăm sóc sức khỏe toàn diện và hiệu quả.

---

## 1. PATIENT – Bệnh nhân (Trung tâm của hệ thống)

**👉 Người dùng cuối, tự quản lý sức khỏe và kết nối với y tế.**

### Chức năng chính
- **Cổng thông tin bệnh nhân (Patient Portal):** Theo dõi phác đồ điều trị cá nhân hóa.
- **Theo dõi chỉ số (CDM Tracking):** Nhập và theo dõi các chỉ số sinh hiệu (Huyết áp, Đường huyết, BMI...) theo thời gian thực.
- **Kết nối bác sỹ (Communication):** Chat trực tiếp với bác sĩ điều trị và nhận hỗ trợ từ AI Assistant 24/7.
- **Quản lý lịch hẹn:** Đặt lịch tái khám, nhận thông báo nhắc lịch và nhắc uống thuốc.
- **Hồ sơ sức khỏe điện tử (EHR):** Xem lịch sử khám bệnh, kết quả xét nghiệm và đơn thuốc điện tử.

---

## 2. DOCTOR – Bác sĩ (Người ra quyết định y khoa)

**👉 Quản lý lộ trình điều trị và theo dõi bệnh nhân sát sao.**

### Chức năng chính
- **Dashboard quản lý bệnh nhân:** Danh sách bệnh nhân đang theo dõi, phân loại mức độ nguy cơ dựa trên dữ liệu sinh hiệu.
- **Hỗ trợ chẩn đoán AI:** AI phân tích dữ liệu lịch sử để đưa ra cảnh báo sớm về các biến chứng tiềm ẩn.
- **Thăm khám & Tư vấn:** Thực hiện tư vấn từ xa hoặc trực tiếp, ghi chép lâm sàng và kê đơn thuốc điện tử.
- **Quản lý phác đồ CDM:** Thiết lập ngưỡng cảnh báo sinh hiệu cho từng bệnh nhân cụ thể.
- **Giao tiếp:** Phản hồi chat, giải đáp thắc mắc và điều chỉnh lộ trình điều trị kịp thời.

---

## 3. CLINIC_MANAGER – Quản lý phòng khám (Vận hành & Kinh doanh)

**👉 Đảm bảo hiệu quả hoạt động và chất lượng dịch vụ của cơ sở.**

### Chức năng chính
- **Quản lý vận hành:** Giám sát luồng bệnh nhân, quản lý nhân sự (bác sĩ, nhân viên) tại chi nhánh.
- **Báo cáo & Phân tích:** Xem báo cáo doanh thu, hiệu suất làm việc của bác sĩ và mức độ hài lòng của bệnh nhân.
- **Quản lý danh mục:** Quản lý gói dịch vụ CDM, danh mục thuốc và vật tư y tế.
- **Marketing & CRM:** Quản lý chương trình chăm sóc khách hàng, thẻ thành viên và các chiến dịch sức khỏe cộng đồng.
- **Giám sát chất lượng:** Theo dõi thời gian chờ trung bình và tỉ lệ tuân thủ phác đồ của bệnh nhân.

---

## 4. SYSTEM_ADMIN – Quản trị hệ thống (IT / Chủ đầu tư)

**👉 Quản trị nền tảng và cấu hình kỹ thuật cấp cao.**

### Chức năng chính
- **Quản lý Multi-tenant:** Khởi tạo và quản lý các phòng khám/chuỗi phòng khám trên hệ thống.
- **Phân quyền & Bảo mật:** Quản lý tài khoản người dùng, thiết lập Role-Based Access Control (RBAC).
- **Cấu hình AI:** Quản lý các phiên bản Model AI, theo dõi độ chính xác và tính giải thích được (Explainability) của AI.
- **Quản trị dữ liệu:** Sao lưu, phục hồi dữ liệu và đảm bảo tính toàn vẹn của hồ sơ bệnh án điện tử.
- **Tích hợp:** Cấu hình các cổng thanh toán (VNPAY, MoMo), dịch vụ SMS/Email và kết nối thiết bị IoT (máy đo HA, đường huyết).

---

## Tóm tắt ma trận chức năng

| Chức năng | Patient | Doctor | Clinic Manager | System Admin |
|-----------|:-------:|:------:|:--------------:|:------------:|
| Theo dõi sinh hiệu | ✅ Xem/Nhập | ✅ Giám sát | ✅ Báo cáo | — |
| Tư vấn & Chat | ✅ Hỏi | ✅ Đáp | — | — |
| Kê đơn & Phác đồ | ✅ Tuân thủ | ✅ Khởi tạo | — | — |
| Quản lý nhân sự | — | — | ✅ Trực tiếp | ✅ Toàn hệ thống |
| Doanh thu & Báo cáo | — | — | ✅ Chi tiết | ✅ Tổng hợp |
| Cấu hình AI & Hệ thống | — | — | — | ✅ Tối cao |
