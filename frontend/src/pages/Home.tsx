import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Hệ thống luồng bệnh nhân & phân loại ưu tiên
      </h1>
      <p className="text-slate-600">
        Ứng dụng cho lễ tân, y tá và bác sĩ: đăng ký bệnh nhân, phân loại ưu tiên (AI), quản lý hàng chờ.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/patients"
          className="card hover:border-primary-300 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-primary-600">Bệnh nhân</h2>
          <p className="text-sm text-slate-600 mt-1">Tìm CCCD, đăng ký mới, cập nhật thông tin</p>
        </Link>
        <Link
          to="/triage"
          className="card hover:border-primary-300 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-primary-600">Phân loại</h2>
          <p className="text-sm text-slate-600 mt-1">Gợi ý AI, sinh hiệu, tạo phiên phân loại</p>
        </Link>
        <Link
          to="/queue"
          className="card hover:border-primary-300 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-primary-600">Hàng chờ</h2>
          <p className="text-sm text-slate-600 mt-1">Xem hàng chờ, thêm bệnh nhân, gọi số</p>
        </Link>
      </div>
      <p className="text-sm text-slate-500">
        Chọn <strong>tenant</strong> và <strong>chi nhánh</strong> ở góc phải trên để bắt đầu.
      </p>
    </div>
  )
}
