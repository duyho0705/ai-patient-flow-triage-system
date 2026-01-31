# Backend – Patient Flow & Triage (Enterprise)

Spring Boot **modular monolith** cho hệ thống luồng bệnh nhân và phân loại ưu tiên bằng AI (phòng khám Việt Nam).

## Tech Stack

- **Java 17**, **Spring Boot 3.2.x**
- **Spring Data JPA**, **PostgreSQL**
- **Spring Web**, **Validation**, **Actuator**
- **Spring Security**, **JWT (JJWT 0.12)**
- **Springdoc OpenAPI 2** (Swagger UI)
- **Lombok**

## Cấu trúc (Modular Monolith)

```
src/main/java/vn/clinic/patientflow/
├── PatientFlowApplication.java
├── api/                    # REST controllers
├── common/                 # Shared: base entity, tenant context, exceptions
├── config/                 # JPA, OpenAPI, Tenant filter
├── tenant/                 # Module: tenant, tenant_branch
│   ├── domain/
│   ├── repository/
│   └── service/
├── identity/               # Module: user, role, user_role
├── patient/                # Module: patient, patient_insurance
├── scheduling/             # Module: slot_template, calendar_day, appointment
├── triage/                 # Module: triage_session, complaint, vital
│   └── ai/                  # AI gợi ý acuity: AiTriageProvider, RuleBasedTriageProvider
├── queue/                  # Module: queue_definition, queue_entry
├── clinical/               # Module: consultation, clinical_vital
└── aiaudit/                # Module: ai_model_version, ai_triage_audit
```

- **Domain:** JPA entities map đúng bảng trong `backend/db/migrations/`.
- **Repository:** Spring Data JPA, tenant-scoped query qua service.
- **Service:** Nghiệp vụ, gọi `TenantContext.getTenantIdOrThrow()` cho API theo tenant.
- **API:** REST; tenant từ JWT (sau login) hoặc header `X-Tenant-Id`; xác thực JWT cho `/api/**` (trừ `/api/auth/login`, GET `/api/tenants/**`).

## Yêu cầu

- **JDK 17+**
- **PostgreSQL** đã chạy migration `00001_initial_schema.sql`, `00002_*` (nếu có), `00003_seed_roles_and_admin.sql` (roles + user admin@example.com / password, tenant CLINIC_DEMO)
- Biến môi trường hoặc `application-dev.yml`: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

## Chạy

```bash
cd backend
./mvnw spring-boot:run
```

Profile mặc định: `dev`. Prod: `SPRING_PROFILES_ACTIVE=prod` và cấu hình `DB_URL`, `DB_USER`, `DB_PASSWORD`.

- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Actuator:** http://localhost:8080/actuator/health

## Multi-tenancy

- Header **`X-Tenant-Id`** (UUID): bắt buộc cho mọi API theo tenant (patient, scheduling, triage, queue, clinical).
- Header **`X-Branch-Id`** (UUID): tùy chọn, chi nhánh hiện tại.
- Filter `TenantFilter` set vào `TenantContext`; service dùng `TenantContext.getTenantIdOrThrow()`.
- Sau khi tích hợp auth: set tenant từ token/session thay vì tin header (tránh client giả mạo).

## Cấu hình (dev)

| Biến | Mặc định |
|------|----------|
| `DB_HOST` | localhost |
| `DB_PORT` | 5432 |
| `DB_NAME` | patient_flow |
| `DB_USER` | postgres |
| `DB_PASSWORD` | postgres |

## Build

```bash
mvn clean package
# Hoặc bỏ qua test khi chưa có DB: mvn clean package -DskipTests
java -jar target/patient-flow-triage-0.1.0-SNAPSHOT.jar
```

Test `PatientFlowApplicationTests` dùng profile `dev` và cần PostgreSQL đã chạy migration. Chạy test với DB thật hoặc dùng `-DskipTests` khi build.

## AI phân loại (Triage)

- **Provider:** `AiTriageProvider` (interface). Mặc định: `RuleBasedTriageProvider` (từ khóa lý do khám + sinh hiệu → acuity 1–5).
- **Cấu hình:** `triage.ai.enabled`, `triage.ai.model-key`, `triage.ai.provider=rule-based`.
- **Luồng:** POST /api/triage/suggest → gợi ý (không ghi audit). POST /api/triage/sessions với `useAiSuggestion=true` → gọi AI, tạo session, ghi `ai_triage_audit` (input/output, latency, model_version).
- **Audit:** Mỗi lần gọi AI khi tạo session được ghi vào `ai_model_version` (tự tạo nếu chưa có) và `ai_triage_audit`.

## Tài liệu

- ERD: `docs/erd-patient-flow-triage-vi.md`
- Schema SQL: `backend/db/migrations/00001_initial_schema.sql`
- Roadmap: `docs/roadmap-tiep-theo.md`
