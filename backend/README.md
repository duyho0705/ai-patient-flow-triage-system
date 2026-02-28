# Backend â€“ Patient Flow & Triage (Enterprise)

Spring Boot **modular monolith** cho há»‡ thá»‘ng luá»“ng bá»‡nh nhÃ¢n vÃ  phÃ¢n loáº¡i Æ°u tiÃªn báº±ng AI (phÃ²ng khÃ¡m Viá»‡t Nam).

## Tech Stack

- **Java 17**, **Spring Boot 3.2.x**
- **Spring Data JPA**, **PostgreSQL**
- **Spring Web**, **Validation**, **Actuator**
- **Spring Security**, **JWT (JJWT 0.12)**
- **Springdoc OpenAPI 2** (Swagger UI)
- **Lombok**

## Cáº¥u trÃºc (Modular Monolith)

```
src/main/java/vn/clinic/cdm/
â”œâ”€â”€ CdmApplication.java
â”œâ”€â”€ api/                    # REST controllers
â”œâ”€â”€ common/                 # Shared: base entity, tenant context, exceptions
â”œâ”€â”€ config/                 # JPA, OpenAPI, Tenant filter
â”œâ”€â”€ tenant/                 # Module: tenant, tenant_branch
â”‚   â”œâ”€â”€ domain/
â”‚   â”œâ”€â”€ repository/
â”‚   â””â”€â”€ service/
â”œâ”€â”€ identity/               # Module: user, role, user_role
â”œâ”€â”€ patient/                # Module: patient, patient_insurance
â”œâ”€â”€ scheduling/             # Module: slot_template, calendar_day, appointment
â”œâ”€â”€ triage/                 # Module: triage_session, complaint, vital
â”‚   â””â”€â”€ ai/                  # AI gá»£i Ã½ acuity: AiTriageProvider, RuleBasedTriageProvider
â”œâ”€â”€ queue/                  # Module: queue_definition, queue_entry
â”œâ”€â”€ clinical/               # Module: consultation, clinical_vital
â””â”€â”€ aiaudit/                # Module: ai_model_version, ai_triage_audit
```

- **Domain:** JPA entities map Ä‘Ãºng báº£ng trong `backend/db/migrations/`.
- **Repository:** Spring Data JPA, tenant-scoped query qua service.
- **Service:** Nghiá»‡p vá»¥, gá»i `TenantContext.getTenantIdOrThrow()` cho API theo tenant.
- **API:** REST; tenant tá»« JWT (sau login) hoáº·c header `X-Tenant-Id`; xÃ¡c thá»±c JWT cho `/api/**` (trá»« `/api/auth/login`, GET `/api/tenants/**`).

## YÃªu cáº§u

- **JDK 17+**
- **PostgreSQL** Ä‘Ã£ cháº¡y migration `00001_initial_schema.sql`, `00002_*` (náº¿u cÃ³), `00003_seed_roles_and_admin.sql` (roles + user admin@example.com / password, tenant CLINIC_DEMO)
- Biáº¿n mÃ´i trÆ°á»ng hoáº·c `application-dev.yml`: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

## Cháº¡y

```bash
cd backend
./mvnw spring-boot:run
```

Profile máº·c Ä‘á»‹nh: `dev`. Prod: `SPRING_PROFILES_ACTIVE=prod` vÃ  cáº¥u hÃ¬nh `DB_URL`, `DB_USER`, `DB_PASSWORD`.

- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Actuator:** http://localhost:8080/actuator/health

## Multi-tenancy

- Header **`X-Tenant-Id`** (UUID): báº¯t buá»™c cho má»i API theo tenant (patient, scheduling, triage, queue, clinical).
- Header **`X-Branch-Id`** (UUID): tÃ¹y chá»n, chi nhÃ¡nh hiá»‡n táº¡i.
- Filter `TenantFilter` set vÃ o `TenantContext`; service dÃ¹ng `TenantContext.getTenantIdOrThrow()`.
- Sau khi tÃ­ch há»£p auth: set tenant tá»« token/session thay vÃ¬ tin header (trÃ¡nh client giáº£ máº¡o).

## Cáº¥u hÃ¬nh (dev)

| Biáº¿n | Máº·c Ä‘á»‹nh |
|------|----------|
| `DB_HOST` | localhost |
| `DB_PORT` | 5432 |
| `DB_NAME` | patient_flow |
| `DB_USER` | postgres |
| `DB_PASSWORD` | postgres |

## Build

```bash
mvn clean package
# Hoáº·c bá» qua test khi chÆ°a cÃ³ DB: mvn clean package -DskipTests
java -jar target/cdm-platform-triage-0.1.0-SNAPSHOT.jar
```

Test `CdmApplicationTests` dÃ¹ng profile `dev` vÃ  cáº§n PostgreSQL Ä‘Ã£ cháº¡y migration. Cháº¡y test vá»›i DB tháº­t hoáº·c dÃ¹ng `-DskipTests` khi build.

## AI phÃ¢n loáº¡i (Triage)

- **Provider:** `AiTriageProvider` (interface). Máº·c Ä‘á»‹nh: `RuleBasedTriageProvider` (tá»« khÃ³a lÃ½ do khÃ¡m + sinh hiá»‡u â†’ acuity 1â€“5).
- **Cáº¥u hÃ¬nh:** `triage.ai.enabled`, `triage.ai.model-key`, `triage.ai.provider=rule-based`.
- **Luá»“ng:** POST /api/triage/suggest â†’ gá»£i Ã½ (khÃ´ng ghi audit). POST /api/triage/sessions vá»›i `useAiSuggestion=true` â†’ gá»i AI, táº¡o session, ghi `ai_triage_audit` (input/output, latency, model_version).
- **Audit:** Má»—i láº§n gá»i AI khi táº¡o session Ä‘Æ°á»£c ghi vÃ o `ai_model_version` (tá»± táº¡o náº¿u chÆ°a cÃ³) vÃ  `ai_triage_audit`.

## TÃ i liá»‡u

- ERD: `docs/erd-cdm-platform-triage-vi.md`
- Schema SQL: `backend/db/migrations/00001_initial_schema.sql`
- Roadmap: `docs/roadmap-tiep-theo.md`

