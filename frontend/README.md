# Frontend – Luồng bệnh nhân & Phân loại ưu tiên

Ứng dụng web cho **lễ tân / y tá / bác sĩ**: đăng ký bệnh nhân, phân loại ưu tiên (AI), quản lý hàng chờ.

## Tech stack

- **React 18** + **TypeScript**
- **Vite** – build & dev server
- **React Router 7** – routing
- **TanStack Query (React Query) 5** – gọi API, cache
- **Tailwind CSS** – giao diện

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── api/           # Client API (tenants, patients, triage, queues)
│   ├── components/    # Layout, TenantSelect
│   ├── context/       # TenantContext (tenantId, branchId)
│   ├── pages/         # Home, Patients, Triage, Queue
│   ├── types/         # DTO TypeScript (api.ts)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Chạy dev

1. **Backend** phải chạy trước tại `http://localhost:8080` (Spring Boot).
2. Trong thư mục `frontend`:

```bash
npm install
npm run dev
```

Mở http://localhost:5173. Vite proxy `/api` tới backend 8080.

## Đa tenant

- Trên header: nhập **mã tenant** (VD: `CLINIC01`) → Chọn tenant → Chọn **chi nhánh**.
- Mọi request (patients, triage, queue) gửi kèm header `X-Tenant-Id`, `X-Branch-Id`.
- Tenant/branch lưu trong `localStorage` để giữ khi refresh.

## Màn hình chính

| Trang       | Mô tả |
|------------|--------|
| **Bệnh nhân** | Tìm theo CCCD, đăng ký mới, cập nhật, danh sách phân trang. |
| **Phân loại** | Chọn bệnh nhân (CCCD) → Lý do khám → Gợi ý AI (rule-based) → Sinh hiệu → Mức ưu tiên (1–5) → Tạo phiên phân loại. |
| **Hàng chờ**  | Chọn định nghĩa hàng → Thêm bệnh nhân (patientId, tùy chọn triageSessionId) → Xem danh sách WAITING → Gọi số. |

## Build production

```bash
npm run build
```

Output trong `dist/`. Deploy thư mục này lên web server (Nginx, etc.); cấu hình reverse proxy `/api` tới backend.

## Biến môi trường

Dev dùng proxy trong `vite.config.ts`. Production cần cấu hình base URL API (hoặc proxy) phù hợp với triển khai.
