# API Endpoints – Patient Flow & Triage

- **Base URL:** `http://localhost:8080` (dev). Swagger UI: `/swagger-ui.html`.
- **Xác thực:** Các API (trừ login và GET tenants) **yêu cầu** header `Authorization: Bearer <JWT>`. JWT chứa userId, email, tenantId, branchId, roles.
- **Tenant:** Khi có JWT, tenant/branch lấy từ token; có thể gửi thêm `X-Tenant-Id`, `X-Branch-Id` để override.

---

## Auth

| Method | Path | Mô tả |
|--------|------|--------|
| POST | /api/auth/login | Đăng nhập. Body: email, password, tenantId (bắt buộc), branchId (tùy chọn). Trả về token, expiresAt, user (id, email, fullNameVi, roles, tenantId, branchId). **Public.** |
| GET | /api/auth/me | Thông tin user hiện tại (từ JWT). Trả về AuthUserDto. **Cần JWT.** |

---

## Tenant (public: GET list & by-code & branches cho màn login)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | /api/tenants | Danh sách tenant đang hoạt động (public cho login) |
| GET | /api/tenants/{id} | Lấy tenant theo ID |
| GET | /api/tenants/by-code/{code} | Lấy tenant theo mã |
| POST | /api/tenants | Tạo tenant (body: code, nameVi, nameEn, taxCode, locale, timezone) |
| GET | /api/tenants/{tenantId}/branches | Danh sách chi nhánh |
| POST | /api/tenants/branches | Tạo chi nhánh (body: tenantId, code, nameVi, addressLine, city, district, ward, phone) |
| GET | /api/tenants/branches/{branchId} | Lấy chi nhánh theo ID |

---

## Patient (X-Tenant-Id bắt buộc)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | /api/patients | Danh sách bệnh nhân (phân trang: page, size) |
| GET | /api/patients/{id} | Lấy bệnh nhân theo ID |
| GET | /api/patients/by-cccd?cccd=... | Tìm theo CCCD |
| POST | /api/patients | Tạo bệnh nhân (body: fullNameVi, dateOfBirth, cccd, externalId, phone, ...) |
| PUT | /api/patients/{id} | Cập nhật bệnh nhân |
| GET | /api/patients/{id}/insurances | Danh sách bảo hiểm |

---

## Scheduling – Lịch hẹn (X-Tenant-Id bắt buộc)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | /api/appointments?branchId=&date= | Danh sách lịch theo chi nhánh + ngày (phân trang) |
| GET | /api/appointments/{id} | Lấy lịch hẹn theo ID |
| POST | /api/appointments | Tạo lịch (body: branchId, patientId, appointmentDate, slotStartTime, status, ...) |
| PATCH | /api/appointments/{id}/status?status= | Cập nhật trạng thái (SCHEDULED, CHECKED_IN, CANCELLED, NO_SHOW, COMPLETED) |
| GET | /api/appointments/slots | Mẫu khung giờ theo tenant |

---

## Triage – Phân loại ưu tiên (X-Tenant-Id bắt buộc)

| Method | Path | Mô tả |
|--------|------|--------|
| POST | /api/triage/suggest | Gợi ý acuity (AI/rule). Body: chiefComplaintText, ageInYears?, patientId?, vitals[], complaintTypes[]. Trả về suggestedAcuity, confidence, latencyMs, providerKey. Không tạo session. |
| POST | /api/triage/sessions | Tạo phiên phân loại. Body: branchId, patientId, startedAt, acuityLevel (bắt buộc nếu useAiSuggestion=false), useAiSuggestion?, complaints[], vitals[], ... Nếu useAiSuggestion=true: gọi AI, ghi audit (ai_triage_audit). |
| GET | /api/triage/sessions/{id} | Lấy phiên theo ID |
| GET | /api/triage/sessions?branchId= | Danh sách phiên theo chi nhánh (phân trang) |
| GET | /api/triage/sessions/{id}/complaints | Lý do khám / triệu chứng |
| GET | /api/triage/sessions/{id}/vitals | Sinh hiệu |

---

## Queue – Hàng chờ (X-Tenant-Id bắt buộc)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | /api/queues/definitions?branchId= | Định nghĩa hàng chờ theo chi nhánh |
| GET | /api/queues/definitions/{queueId}/entries?branchId= | Danh sách đang chờ (WAITING) |
| GET | /api/queues/entries/{id} | Lấy bản ghi hàng chờ theo ID |
| POST | /api/queues/entries | Thêm vào hàng (query: queueDefinitionId, patientId, position, triageSessionId?, appointmentId?) |
| PATCH | /api/queues/entries/{id} | Cập nhật trạng thái (body: status, calledAt, completedAt, position) |
| PATCH | /api/queues/entries/{id}/call | Gọi bệnh nhân (status=CALLED, calledAt=now) |

---

## Admin (chỉ role ADMIN, JWT bắt buộc)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | /api/admin/users?tenantId=&page=&size= | Danh sách user (phân trang, lọc theo tenant). |
| GET | /api/admin/users/{id} | Chi tiết user (roleAssignments theo tenant/branch). |
| POST | /api/admin/users | Tạo user (body: email, fullNameVi, password, phone?, tenantId, roleCode, branchId?). |
| PATCH | /api/admin/users/{id} | Cập nhật user (fullNameVi?, isActive?, roleAssignments?). |
| PATCH | /api/admin/users/{id}/password | Đặt mật khẩu (body: newPassword). |
| GET | /api/admin/roles | Danh sách role (id, code, nameVi). |

---

## AI Audit (X-Tenant-Id, X-Branch-Id)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | /api/ai-audit?branchId=&page=&size= | Danh sách AI audit theo chi nhánh (suggested vs actual acuity, matched/override). Phân trang. |

---

## Health

| Method | Path | Mô tả |
|--------|------|--------|
| GET | /api/health | Liveness |
| GET | /actuator/health | Health chi tiết (DB, v.v.) |
