# Roadmap â€“ LÃ m gÃ¬ tiáº¿p theo

Sau khi Ä‘Ã£ cÃ³ **ERD** ([erd-cdm-platform-triage-vi.md](./erd-cdm-platform-triage-vi.md)), thá»© tá»± lÃ m tiáº¿p há»£p lÃ½:

---

## 1. Schema database (SQL DDL) âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** CÃ³ script táº¡o báº£ng tháº­t tá»« ERD (PostgreSQL hoáº·c MySQL).
- **Káº¿t quáº£:** File migration `backend/db/migrations/00001_initial_schema.sql` (PostgreSQL 10+), Ä‘áº§y Ä‘á»§ báº£ng, FK, index, CHECK, trigger `updated_at`, comment.
- **Lá»£i Ã­ch:** Backend (Spring Boot) sau nÃ y chá»‰ cáº§n map entity vÃ o báº£ng cÃ³ sáºµn; DBA/DevOps cÃ³ thá»ƒ review vÃ  chá»‰nh schema. Xem `backend/db/README.md` Ä‘á»ƒ cháº¡y migration.

---

## 2. Khá»Ÿi táº¡o Backend (Spring Boot) âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** Dá»± Ã¡n Java Spring Boot vá»›i cáº¥u trÃºc **modular monolith** (package theo module: tenant, identity, patient, scheduling, triage, queue, clinical, ai_audit).
- **ÄÃ£ cÃ³:**
  - Maven, Java 17, Spring Boot 3.2.x.
  - JPA entities map Ä‘Ãºng 18 báº£ng trong ERD; BaseEntity, BaseAuditableEntity; JPA Auditing.
  - Repositories (Spring Data JPA) cho tá»«ng module.
  - Services (tenant-scoped qua TenantContext); TenantFilter (header X-Tenant-Id, X-Branch-Id).
  - GlobalExceptionHandler, ApiError; OpenAPI/Swagger; Actuator.
  - API máº«u: TenantController, HealthController. Xem `backend/README.md`.
- **BÆ°á»›c sau:** REST API Ä‘áº§y Ä‘á»§ tá»«ng module (CRUD, Ä‘áº·t lá»‹ch, phÃ¢n loáº¡i, hÃ ng chá») vÃ  tÃ­ch há»£p auth.

---

## 3. Thiáº¿t káº¿ API (REST) âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** Äá»‹nh nghÄ©a endpoint chÃ­nh (OpenAPI/Swagger) cho tá»«ng module.
- **ÄÃ£ cÃ³:**
  - **Tenant:** GET/POST /api/tenants, GET/POST /api/tenants/.../branches (DTO, validation).
  - **Patient:** GET/POST/PUT /api/patients, GET by-cccd, GET /insurances (phÃ¢n trang, DTO).
  - **Scheduling:** GET/POST /api/appointments, PATCH status, GET slots (branchId, date).
  - **Triage:** POST /api/triage/sessions (complaints, vitals), GET session, complaints, vitals.
  - **Queue:** GET definitions, GET/POST entries, PATCH entry, PATCH /call.
  - DTO request/response, PagedResponse, validation; Swagger qua Springdoc. Xem `docs/api-endpoints.md`.
- **BÆ°á»›c sau:** TÃ­ch há»£p auth (JWT/OAuth2), set tenant tá»« token thay vÃ¬ header.

---

## 4. TÃ­ch há»£p AI phÃ¢n loáº¡i (Triage) âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** Service/API gá»i model AI (hoáº·c rule-based) Ä‘á»ƒ gá»£i Ã½ `acuity_level`; ghi `triage_session` + `ai_triage_audit`.
- **ÄÃ£ cÃ³:**
  - **AiTriageProvider** (interface) + **RuleBasedTriageProvider**: tá»« khÃ³a lÃ½ do khÃ¡m (Viá»‡t/Anh) + sinh hiá»‡u â†’ acuity 1â€“5 (ESI). Cáº¥u hÃ¬nh `triage.ai.provider=rule-based`.
  - **AiTriageService**: `suggest(TriageInput)` (Ä‘o latency), `recordAudit(triageSessionId, input, result)`; `getOrCreateCurrentModelVersion(modelKey)` (tá»± táº¡o báº£n ghi khi chÆ°a cÃ³).
  - **TriageService**: Khi `useAiSuggestion=true` trong CreateTriageSessionRequest â†’ gá»i AI, ghi session vá»›i acuity_source=AI, ghi `ai_triage_audit` sau khi táº¡o session.
  - **API:** POST /api/triage/suggest (body: chiefComplaintText, patientId?, ageInYears?, vitals[]) â†’ suggestedAcuity, confidence, latencyMs, providerKey. POST /api/triage/sessions há»— trá»£ `useAiSuggestion`.
  - Cáº¥u hÃ¬nh: `triage.ai.enabled`, `triage.ai.model-key`, `triage.ai.provider`. Xem `docs/api-endpoints.md`.
- **BÆ°á»›c sau:** ThÃªm provider khÃ¡c (LLM/API bÃªn ngoÃ i) hoáº·c tinh chá»‰nh rule; Ä‘Ã¡nh giÃ¡ model vÃ  A/B test.

---

## 5. Frontend (Web) âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** á»¨ng dá»¥ng web cho lá»… tÃ¢n / y tÃ¡ / bÃ¡c sÄ©: Ä‘Äƒng kÃ½ bá»‡nh nhÃ¢n, Ä‘áº·t lá»‹ch, phÃ¢n loáº¡i, xem hÃ ng chá», gá»i sá»‘.
- **ÄÃ£ cÃ³:**
  - **Tech:** React 18 + TypeScript, Vite, React Router, TanStack Query, Tailwind CSS.
  - **Äa tenant:** TenantContext + TenantSelect; header X-Tenant-Id, X-Branch-Id.
  - **Role:** RoleContext (Admin, Receptionist, Triage Nurse, Doctor, Clinic Manager); Dashboard theo role.
  - **MÃ n hÃ¬nh:** Trang chá»§; **Tá»•ng quan** (Dashboard theo role); **Bá»‡nh nhÃ¢n**; **PhÃ¢n loáº¡i** (gá»£i Ã½ AI, override reason); **HÃ ng chá»** (sort theo acuity, cá»™t Æ°u tiÃªn); **AI Audit** (so sÃ¡nh suggested vs actual).
  - API client (`/api`), proxy Vite â†’ backend 8080. Xem `frontend/README.md`.
- **BÆ°á»›c sau:** Auth (JWT), phÃ¢n quyá»n theo role (áº©n menu/theo API).

---

## 5b. Enterprise / CV (AI Audit, Explainability, Queue acuity) âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** LÃ m Ä‘áº¹p CV / enterprise: AI Audit + Explainability, override reason, hÃ ng chá» theo Æ°u tiÃªn.
- **ÄÃ£ cÃ³:**
  - **Backend:** GET /api/ai-audit?branchId=&page=&size= â€” danh sÃ¡ch AI audit, so sÃ¡nh suggested acuity vs actual acuity (matched/override). Triage: cá»™t `override_reason` (migration 00002), DTO + entity. Queue: getWaitingEntries sort theo acuity (1 trÆ°á»›c 5) rá»“i joinedAt; QueueEntryDto cÃ³ `acuityLevel`.
  - **Frontend:** Trang **AI Audit** (báº£ng suggested vs actual, Khá»›p/Override, latency); form **PhÃ¢n loáº¡i** cÃ³ field "LÃ½ do override"; **HÃ ng chá»** cÃ³ cá»™t Æ¯u tiÃªn (acuity), danh sÃ¡ch Ä‘Ã£ sort.
  - **Docs:** `docs/architecture.md` cáº­p nháº­t (sÆ¡ Ä‘á»“, luá»“ng, module, enterprise highlights); `docs/roles-and-features.md` (role & chá»©c nÄƒng).
- **BÆ°á»›c sau:** Auth (JWT) + phÃ¢n quyá»n; Admin quáº£n lÃ½ user/role; Clinic Manager bÃ¡o cÃ¡o.

---

## 6. Auth (JWT) + PhÃ¢n quyá»n âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** Login, JWT chá»©a tenant/branch/role; API kiá»ƒm tra JWT; frontend áº©n menu theo role.
- **ÄÃ£ cÃ³:**
  - **Backend:** Spring Security + JWT (JJWT 0.12). POST /api/auth/login (email, password, tenantId, branchId?) â†’ token + user. GET /api/auth/me (cáº§n JWT). JwtAuthFilter: Bearer token â†’ validate â†’ SecurityContext (AuthPrincipal) + TenantContext. SecurityConfig: permit /api/auth/login, GET /api/tenants/**; authenticated /api/**.
  - **Identity:** getRoleCodesForUserInTenantAndBranch (branch_id IS NULL hoáº·c = branchId). Seed: 5 role (admin, receptionist, triage_nurse, doctor, clinic_manager), tenant CLINIC_DEMO, user admin@example.com / password.
  - **Frontend:** Trang /login (email, password, chá»n tenant + branch); AuthContext (token, user, login, logout); api client gá»­i Authorization: Bearer; RequireAuth â†’ redirect /login; Layout hiá»ƒn thá»‹ user + ÄÄƒng xuáº¥t; nav AI Audit chá»‰ cho role admin.
- **BÆ°á»›c sau:** PhÃ¢n quyá»n chi tiáº¿t theo endpoint (method security) cho tá»«ng API; Clinic Manager bÃ¡o cÃ¡o.

---

## 6b. Admin API + Method Security âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** Quáº£n lÃ½ user, gÃ¡n role theo tenant/branch; chá»‰ ADMIN truy cáº­p.
- **ÄÃ£ cÃ³:**
  - **Backend:** AdminService (listUsers theo tenant, createUser, updateUser, setPassword, getRoles). AdminController: GET/POST/PATCH /api/admin/users, PATCH .../password, GET /api/admin/roles. @PreAuthorize("hasRole('ADMIN')") trÃªn controller. IdentityUser cÃ³ OneToMany userRoles; IdentityUserRepository.findDistinctByTenantId cho list theo tenant.
  - **Frontend:** Trang /admin (chá»‰ admin): báº£ng user (lá»c tenant, phÃ¢n trang), form táº¡o user (email, fullNameVi, password, tenant, role, branch), form sá»­a (fullNameVi, isActive), form Ä‘áº·t máº­t kháº©u. Nav "Quáº£n trá»‹" chá»‰ hiá»‡n khi role admin.
- **BÆ°á»›c sau:** Clinic Manager bÃ¡o cÃ¡o; tÃ¹y chá»n phÃ¢n quyá»n tá»«ng API (e.g. AI Audit chá»‰ admin).

---

## 7. Cáº­p nháº­t tÃ i liá»‡u kiáº¿n trÃºc âœ… ÄÃ£ xong

- **Má»¥c Ä‘Ã­ch:** File `docs/architecture.md` thÃªm link ERD, sÆ¡ Ä‘á»“ component, luá»“ng, module, enterprise highlights.
- **ÄÃ£ cÃ³:** Xem `docs/architecture.md`.

---

## Gá»£i Ã½ thá»© tá»± lÃ m

| Thá»© tá»± | Viá»‡c | LÃ½ do |
|--------|------|--------|
| 1 | **Schema SQL (DDL)** | CÃ³ DB tháº­t, backend vÃ  AI service Ä‘á»u dá»±a vÃ o Ä‘Ã¢y. |
| 2 | **Backend Spring Boot + entities** | Map ERD thÃ nh code, sáºµn sÃ ng viáº¿t API. |
| 3 | **API cÆ¡ báº£n (tenant, patient, triage, queue)** | CÃ³ endpoint Ä‘á»ƒ frontend vÃ  tÃ­ch há»£p AI gá»i. |
| 4 | **AI triage (rule hoáº·c API)** | HoÃ n thiá»‡n luá»“ng phÃ¢n loáº¡i vÃ  audit. |
| 5 | **Frontend** | Giao diá»‡n cho nhÃ¢n viÃªn phÃ²ng khÃ¡m. |
| 6 | **Architecture doc** | Cho ngÆ°á»i má»›i vÃ o dá»± Ã¡n Ä‘á»c nhanh. |

Báº¡n muá»‘n báº¯t Ä‘áº§u tá»« **bÆ°á»›c 1 (SQL schema)** hay **bÆ°á»›c 2 (Spring Boot + entities)**? MÃ¬nh cÃ³ thá»ƒ viáº¿t giÃºp script DDL (PostgreSQL hoáº·c MySQL) hoáº·c khung dá»± Ã¡n Spring Boot theo Ä‘Ãºng ERD.
