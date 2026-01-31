# System Architecture

Kiến trúc tổng quan của **Hệ thống Luồng bệnh nhân & Phân loại ưu tiên** (AI-powered Patient Flow and Triage) cho phòng khám tại Việt Nam.

---

## Tài liệu liên quan

- **ERD:** [erd-patient-flow-triage-vi.md](./erd-patient-flow-triage-vi.md) (tiếng Việt), [erd-patient-flow-triage.md](./erd-patient-flow-triage.md) (tiếng Anh)
- **API:** [api-endpoints.md](./api-endpoints.md)
- **Role & chức năng:** [roles-and-features.md](./roles-and-features.md)
- **Roadmap:** [roadmap-tiep-theo.md](./roadmap-tiep-theo.md)

---

## Sơ đồ component (cao cấp)

```
┌─────────────────┐     REST (JSON)      ┌─────────────────┐
│   Web UI        │ ◄─────────────────► │   Backend API   │
│   (React/Vite)  │   X-Tenant-Id       │   (Spring Boot) │
│                 │   X-Branch-Id       │                 │
└─────────────────┘                     └────────┬────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
                    ▼                             ▼                             ▼
            ┌───────────────┐             ┌───────────────┐             ┌───────────────┐
            │  PostgreSQL  │             │ AI Triage     │             │ (Identity /   │
            │  (DB)        │             │ Provider      │             │  Auth – plan)  │
            │  tenant,      │             │ (rule-based   │             │               │
            │  patient,     │             │  or pluggable)│             │               │
            │  triage,      │             │               │             │               │
            │  queue,       │             │ ai_triage_    │             │               │
            │  ai_triage_  │             │ audit         │             │               │
            │  audit        │             │               │             │               │
            └───────────────┘             └───────────────┘             └───────────────┘
```

- **Web UI:** Đa tenant (tenant + chi nhánh từ header). Role: Admin, Receptionist, Triage Nurse, Doctor, Clinic Manager.
- **Backend:** Modular monolith. Mọi API (trừ Tenant) yêu cầu `X-Tenant-Id`; `X-Branch-Id` tùy chọn.
- **DB:** Một schema PostgreSQL; tenant_id / branch_id trên các bảng nghiệp vụ.
- **AI Triage:** Provider interface; rule-based hiện tại; mỗi lần gọi AI ghi `ai_triage_audit` (Explainability).
- **Auth:** Dự kiến JWT; role trong token; phân quyền theo role. Xem roadmap.

---

## Luồng nghiệp vụ chính

1. **Tiếp nhận** (Receptionist): Tìm/tạo bệnh nhân (CCCD/SĐT), đặt lịch, check-in, walk-in.
2. **Phân loại** (Triage Nurse): Tạo phiên phân loại — lý do khám, sinh hiệu; AI gợi ý acuity (1–5); chấp nhận hoặc override (ghi lý do); đưa vào hàng chờ theo ưu tiên.
3. **Hàng chờ:** Sắp xếp theo acuity (1 trước 5) rồi thời gian vào hàng; bác sĩ xem danh sách, gọi số.
4. **Khám** (Doctor): Xem hồ sơ (lý do, sinh hiệu, kết quả AI triage), ghi chẩn đoán/chỉ định, kết thúc lượt.
5. **Admin / AI Audit:** Quản lý tenant, user, role; xem lịch sử AI (đề xuất vs quyết định thực tế) — **Explainability**.

---

## Module backend (modular monolith)

| Module       | Mô tả ngắn |
|-------------|------------|
| **tenant**  | Phòng khám, chi nhánh. |
| **identity**| User, role (dùng cho phân quyền; Auth JWT dự kiến). |
| **patient** | Bệnh nhân, bảo hiểm. |
| **scheduling** | Lịch hẹn, khung giờ. |
| **triage**  | Phiên phân loại, lý do khám, sinh hiệu; AI gợi ý acuity; override reason. |
| **queue**   | Định nghĩa hàng chờ, bản ghi hàng chờ; sort theo acuity. |
| **clinical**| Khám, chẩn đoán (mở rộng sau). |
| **aiaudit** | AiModelVersion, AiTriageAudit; API list audit (suggested vs actual). |

---

## Enterprise / CV highlights

- **AI Audit + Explainability:** Mỗi lần gọi AI ghi `ai_triage_audit`; API so sánh suggested acuity vs actual acuity (quyết định con người).
- **Override reason:** Khi y tá không chấp nhận gợi ý AI, ghi `override_reason` trong phiên phân loại.
- **Hàng chờ theo ưu tiên:** Danh sách chờ sort theo acuity (1 trước 5) rồi thời gian vào hàng; DTO có `acuityLevel` để hiển thị.
- **Đa tenant:** Tenant + chi nhánh; mọi dữ liệu scoped theo tenant.
- **Role-based:** Admin, Receptionist, Triage Nurse, Doctor, Clinic Manager; phân quyền thật (Auth JWT) là bước tiếp theo.
