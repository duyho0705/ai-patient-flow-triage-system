# Roadmap – Làm gì tiếp theo

Sau khi đã có **ERD** ([erd-patient-flow-triage-vi.md](./erd-patient-flow-triage-vi.md)), thứ tự làm tiếp hợp lý:

---

## 1. Schema database (SQL DDL) ✅ Đã xong

- **Mục đích:** Có script tạo bảng thật từ ERD (PostgreSQL hoặc MySQL).
- **Kết quả:** File migration `backend/db/migrations/00001_initial_schema.sql` (PostgreSQL 10+), đầy đủ bảng, FK, index, CHECK, trigger `updated_at`, comment.
- **Lợi ích:** Backend (Spring Boot) sau này chỉ cần map entity vào bảng có sẵn; DBA/DevOps có thể review và chỉnh schema. Xem `backend/db/README.md` để chạy migration.

---

## 2. Khởi tạo Backend (Spring Boot) ✅ Đã xong

- **Mục đích:** Dự án Java Spring Boot với cấu trúc **modular monolith** (package theo module: tenant, identity, patient, scheduling, triage, queue, clinical, ai_audit).
- **Đã có:**
  - Maven, Java 17, Spring Boot 3.2.x.
  - JPA entities map đúng 18 bảng trong ERD; BaseEntity, BaseAuditableEntity; JPA Auditing.
  - Repositories (Spring Data JPA) cho từng module.
  - Services (tenant-scoped qua TenantContext); TenantFilter (header X-Tenant-Id, X-Branch-Id).
  - GlobalExceptionHandler, ApiError; OpenAPI/Swagger; Actuator.
  - API mẫu: TenantController, HealthController. Xem `backend/README.md`.
- **Bước sau:** REST API đầy đủ từng module (CRUD, đặt lịch, phân loại, hàng chờ) và tích hợp auth.

---

## 3. Thiết kế API (REST) ✅ Đã xong

- **Mục đích:** Định nghĩa endpoint chính (OpenAPI/Swagger) cho từng module.
- **Đã có:**
  - **Tenant:** GET/POST /api/tenants, GET/POST /api/tenants/.../branches (DTO, validation).
  - **Patient:** GET/POST/PUT /api/patients, GET by-cccd, GET /insurances (phân trang, DTO).
  - **Scheduling:** GET/POST /api/appointments, PATCH status, GET slots (branchId, date).
  - **Triage:** POST /api/triage/sessions (complaints, vitals), GET session, complaints, vitals.
  - **Queue:** GET definitions, GET/POST entries, PATCH entry, PATCH /call.
  - DTO request/response, PagedResponse, validation; Swagger qua Springdoc. Xem `docs/api-endpoints.md`.
- **Bước sau:** Tích hợp auth (JWT/OAuth2), set tenant từ token thay vì header.

---

## 4. Tích hợp AI phân loại (Triage)

- **Mục đích:** Service/API gọi model AI (hoặc rule-based) để gợi ý `acuity_level`; ghi `triage_session` + `ai_triage_audit`.
- **Bao gồm:**
  - Input: chief complaint, vitals, tuổi (từ patient).
  - Output: suggested acuity, confidence (nếu có).
  - Ghi audit: `ai_model_version`, `ai_triage_audit` (input/output, latency).
- **Triển khai:** Có thể bắt đầu bằng rule đơn giản hoặc LLM/API bên ngoài, sau đó thay bằng model riêng.

---

## 5. Frontend (Web)

- **Mục đích:** Ứng dụng web cho lễ tân / y tá / bác sĩ: đăng ký bệnh nhân, đặt lịch, phân loại, xem hàng chờ, gọi số.
- **Tech:** Có thể React, Vue, hoặc Next.js; gọi REST API backend.
- **Ưu tiên:** Màn hình đăng ký + phân loại + hàng chờ trước; sau đó lịch hẹn và khám.

---

## 6. Cập nhật tài liệu kiến trúc

- **Mục đích:** File `docs/architecture.md` thêm:
  - Link tới ERD (tiếng Việt + tiếng Anh).
  - Sơ đồ component (Frontend ↔ Backend ↔ DB ↔ AI Service).
  - Giải thích ngắn từng module và luồng chính (đặt lịch → đến khám → phân loại → hàng chờ → khám).

---

## Gợi ý thứ tự làm

| Thứ tự | Việc | Lý do |
|--------|------|--------|
| 1 | **Schema SQL (DDL)** | Có DB thật, backend và AI service đều dựa vào đây. |
| 2 | **Backend Spring Boot + entities** | Map ERD thành code, sẵn sàng viết API. |
| 3 | **API cơ bản (tenant, patient, triage, queue)** | Có endpoint để frontend và tích hợp AI gọi. |
| 4 | **AI triage (rule hoặc API)** | Hoàn thiện luồng phân loại và audit. |
| 5 | **Frontend** | Giao diện cho nhân viên phòng khám. |
| 6 | **Architecture doc** | Cho người mới vào dự án đọc nhanh. |

Bạn muốn bắt đầu từ **bước 1 (SQL schema)** hay **bước 2 (Spring Boot + entities)**? Mình có thể viết giúp script DDL (PostgreSQL hoặc MySQL) hoặc khung dự án Spring Boot theo đúng ERD.
