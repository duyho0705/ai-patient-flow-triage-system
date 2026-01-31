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
  - **Tech:** React 18 + TypeScript, Vite, React Router, TanStack Query, Tailwind CSS.
  - **Đa tenant:** TenantContext + TenantSelect; header X-Tenant-Id, X-Branch-Id.
  - **Role:** RoleContext (Admin, Receptionist, Triage Nurse, Doctor, Clinic Manager); Dashboard theo role.
  - **Màn hình:** Trang chủ; **Tổng quan** (Dashboard theo role); **Bệnh nhân**; **Phân loại** (gợi ý AI, override reason); **Hàng chờ** (sort theo acuity, cột ưu tiên); **AI Audit** (so sánh suggested vs actual).
  - API client (`/api`), proxy Vite → backend 8080. Xem `frontend/README.md`.
- **Bước sau:** Auth (JWT), phân quyền theo role (ẩn menu/theo API).

---

## 5b. Enterprise / CV (AI Audit, Explainability, Queue acuity) ✅ Đã xong

- **Mục đích:** Làm đẹp CV / enterprise: AI Audit + Explainability, override reason, hàng chờ theo ưu tiên.
- **Đã có:**
  - **Backend:** GET /api/ai-audit?branchId=&page=&size= — danh sách AI audit, so sánh suggested acuity vs actual acuity (matched/override). Triage: cột `override_reason` (migration 00002), DTO + entity. Queue: getWaitingEntries sort theo acuity (1 trước 5) rồi joinedAt; QueueEntryDto có `acuityLevel`.
  - **Frontend:** Trang **AI Audit** (bảng suggested vs actual, Khớp/Override, latency); form **Phân loại** có field "Lý do override"; **Hàng chờ** có cột Ưu tiên (acuity), danh sách đã sort.
  - **Docs:** `docs/architecture.md` cập nhật (sơ đồ, luồng, module, enterprise highlights); `docs/roles-and-features.md` (role & chức năng).
- **Bước sau:** Auth (JWT) + phân quyền; Admin quản lý user/role; Clinic Manager báo cáo.

---

## 6. Auth (JWT) + Phân quyền ✅ Đã xong

- **Mục đích:** Login, JWT chứa tenant/branch/role; API kiểm tra JWT; frontend ẩn menu theo role.
- **Đã có:**
  - **Backend:** Spring Security + JWT (JJWT 0.12). POST /api/auth/login (email, password, tenantId, branchId?) → token + user. GET /api/auth/me (cần JWT). JwtAuthFilter: Bearer token → validate → SecurityContext (AuthPrincipal) + TenantContext. SecurityConfig: permit /api/auth/login, GET /api/tenants/**; authenticated /api/**.
  - **Identity:** getRoleCodesForUserInTenantAndBranch (branch_id IS NULL hoặc = branchId). Seed: 5 role (admin, receptionist, triage_nurse, doctor, clinic_manager), tenant CLINIC_DEMO, user admin@example.com / password.
  - **Frontend:** Trang /login (email, password, chọn tenant + branch); AuthContext (token, user, login, logout); api client gửi Authorization: Bearer; RequireAuth → redirect /login; Layout hiển thị user + Đăng xuất; nav AI Audit chỉ cho role admin.
- **Bước sau:** Phân quyền chi tiết theo endpoint (method security) cho từng API; Clinic Manager báo cáo.

---

## 6b. Admin API + Method Security ✅ Đã xong

- **Mục đích:** Quản lý user, gán role theo tenant/branch; chỉ ADMIN truy cập.
- **Đã có:**
  - **Backend:** AdminService (listUsers theo tenant, createUser, updateUser, setPassword, getRoles). AdminController: GET/POST/PATCH /api/admin/users, PATCH .../password, GET /api/admin/roles. @PreAuthorize("hasRole('ADMIN')") trên controller. IdentityUser có OneToMany userRoles; IdentityUserRepository.findDistinctByTenantId cho list theo tenant.
  - **Frontend:** Trang /admin (chỉ admin): bảng user (lọc tenant, phân trang), form tạo user (email, fullNameVi, password, tenant, role, branch), form sửa (fullNameVi, isActive), form đặt mật khẩu. Nav "Quản trị" chỉ hiện khi role admin.
- **Bước sau:** Clinic Manager báo cáo; tùy chọn phân quyền từng API (e.g. AI Audit chỉ admin).

---

## 7. Cập nhật tài liệu kiến trúc ✅ Đã xong

- **Mục đích:** File `docs/architecture.md` thêm link ERD, sơ đồ component, luồng, module, enterprise highlights.
- **Đã có:** Xem `docs/architecture.md`.

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
