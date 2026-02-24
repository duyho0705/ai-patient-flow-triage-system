# Implementation Plan – Hoàn thiện hệ thống

## Phân tích hiện trạng

### ✅ Đã hoàn thành
| Module | Backend | Frontend | Ghi chú |
|--------|---------|----------|---------|
| Auth (JWT + Register) | ✅ | ✅ | Login, Register, Role-based |
| Admin (User/Role) | ✅ | ✅ | CRUD users, assign roles |
| Tenant/Branch | ✅ | ✅ | Multi-tenant, branch select |
| Patient CRUD | ✅ | ✅ | Search CCCD/SĐT, create |
| Reception (Check-in) | ✅ | ✅ | Walk-in, check-in flow |
| Triage (AI) | ✅ | ✅ | AI suggest, override, lý do |
| Queue | ✅ | ✅ | Sort acuity, call, WebSocket |
| Scheduling | ✅ | ✅ | Lịch hẹn, slots |
| Consultation (Doctor) | ✅ | ✅ | Khám, chẩn đoán, đơn thuốc, AI CDS |
| Billing/VNPAY | ✅ | ✅ | Hóa đơn, thanh toán |
| Pharmacy | ✅ | ✅ | Kho thuốc, cấp phát |
| Reports/Export | ✅ | ✅ | PDF/Excel, biểu đồ |
| Analytics | ✅ | ✅ | Heatmap, AI insights |
| AI Audit | ✅ | ✅ | Suggested vs Actual |
| Patient Portal | ✅ | ✅ | 13 pages, AI assistant |
| Doctor Portal | ✅ | ✅ | Dashboard, chat, profile |
| Kiosk / Display | ✅ | ✅ | Public queue display |
| Landing Page | ✅ | ✅ | Marketing page |

### ⚠️ Cần hoàn thiện
1. **TypeScript warnings** – Unused imports/vars (PatientEhr, AiAudit)
2. **DoctorConsultation page** – Exists but not routed in App.tsx
3. **Test coverage** – Chỉ có 2 test files
4. **Docs outdated** – roadmap-tiep-theo.md chưa update
5. **Docker** – Chỉ có DB, thiếu backend + frontend container

---

## Kế hoạch hoàn thiện (ưu tiên từ cao đến thấp)

### Phase 1: Fix & Polish (Ưu tiên cao nhất)
1. Fix TypeScript warnings (unused imports)
2. Update roadmap documentation
3. Thêm seed data migration (V29) – demo data cho presentation
4. Cải thiện error handling toàn cục

### Phase 2: Testing & Quality
5. Thêm unit tests cho service layer
6. Integration test cho API chính

### Phase 3: DevOps & Deployment  
7. Docker Compose hoàn chỉnh (backend + frontend + DB)
8. Cập nhật README hướng dẫn chi tiết
