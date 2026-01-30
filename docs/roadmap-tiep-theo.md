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

## 4. Tích hợp AI phân loại (Triage) ✅ Đã xong

- **Mục đích:** Service/API gọi model AI (hoặc rule-based) để gợi ý `acuity_level`; ghi `triage_session` + `ai_triage_audit`.
- **Đã có:**
  - **AiTriageProvider** (interface) + **RuleBasedTriageProvider**: từ khóa lý do khám (Việt/Anh) + sinh hiệu → acuity 1–5 (ESI). Cấu hình `triage.ai.provider=rule-based`.
  - **AiTriageService**: `suggest(TriageInput)` (đo latency), `recordAudit(triageSessionId, input, result)`; `getOrCreateCurrentModelVersion(modelKey)` (tự tạo bản ghi khi chưa có).
  - **TriageService**: Khi `useAiSuggestion=true` trong CreateTriageSessionRequest → gọi AI, ghi session với acuity_source=AI, ghi `ai_triage_audit` sau khi tạo session.
  - **API:** POST /api/triage/suggest (body: chiefComplaintText, patientId?, ageInYears?, vitals[]) → suggestedAcuity, confidence, latencyMs, providerKey. POST /api/triage/sessions hỗ trợ `useAiSuggestion`.
  - Cấu hình: `triage.ai.enabled`, `triage.ai.model-key`, `triage.ai.provider`. Xem `docs/api-endpoints.md`.
- **Bước sau:** Thêm provider khác (LLM/API bên ngoài) hoặc tinh chỉnh rule; đánh giá model và A/B test.

---

## 5. Frontend (Web) ✅ Đã xong

- **Mục đích:** Ứng dụng web cho lễ tân / y tá / bác sĩ: đăng ký bệnh nhân, đặt lịch, phân loại, xem hàng chờ, gọi số.
- **Đã có:**
  - **Tech:** React 18 + TypeScript, Vite, React Router 7, TanStack Query 5, Tailwind CSS.
  - **Đa tenant:** TenantContext + TenantSelect (mã tenant → chi nhánh); header X-Tenant-Id, X-Branch-Id; lưu localStorage.
  - **Màn hình:** Trang chủ; **Bệnh nhân** (tìm CCCD, đăng ký/cập nhật, danh sách phân trang); **Phân loại** (chọn BN → lý do khám → gợi ý AI → sinh hiệu → mức ưu tiên 1–5 → tạo phiên); **Hàng chờ** (định nghĩa hàng, thêm BN vào hàng, danh sách WAITING, gọi số).
  - API client (`/api`), proxy Vite → backend 8080. Xem `frontend/README.md`.
- **Bước sau:** Màn hình lịch hẹn (scheduling), khám lâm sàng; tích hợp auth (JWT) khi backend có.

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
