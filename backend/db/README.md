# Database – Hệ thống Luồng bệnh nhân & Phân loại ưu tiên

## Yêu cầu

- **PostgreSQL 10+** (khuyến nghị 14+). Dùng `uuid`, `timestamptz`, `jsonb`; `gen_random_uuid()` có sẵn từ PG13 (PG10–12 cần `CREATE EXTENSION pgcrypto`).
- Quyền tạo bảng, index, trigger (hoặc chạy migration với user có quyền).

## Cấu trúc

- `migrations/` – Script DDL đánh số, chạy theo thứ tự.
- Migration đầu: `00001_initial_schema.sql` – toàn bộ bảng, FK, index, trigger, comment theo ERD.

## Chạy migration

### Cách 1: psql (thủ công)

```bash
cd backend/db
psql -h <host> -U <user> -d <database> -f migrations/00001_initial_schema.sql
```

### Cách 2: Flyway / Liquibase

- Copy nội dung từng file trong `migrations/` vào Flyway (V1__initial_schema.sql) hoặc Liquibase changelog.
- Không chạy trùng migration đã apply (Flyway/Liquibase quản lý bảng schema_version).

## Cách ly tenant (multi-tenancy)

- Mọi bảng theo tenant có cột `tenant_id`. Ứng dụng **bắt buộc** lọc mọi truy vấn theo `tenant_id` (từ context đăng nhập).
- Có thể bổ sung **Row-Level Security (RLS)** trên PostgreSQL: policy `tenant_id = current_setting('app.current_tenant_id')::uuid` cho SELECT/INSERT/UPDATE/DELETE; set `app.current_tenant_id` trong connection/session sau khi auth.
- Không xóa tenant khi còn dữ liệu con: FK dùng `ON DELETE RESTRICT` (mặc định) để tránh xóa nhầm.

## Rollback

- Migration đầu là “full create”; rollback = drop schema hoặc drop từng bảng theo thứ tự ngược (xóa bảng con trước). Script rollback riêng có thể thêm sau khi có nhiều migration.
