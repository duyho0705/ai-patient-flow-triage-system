import {
    Users,
    UserPlus,
    Search,
    Download,
    Edit2,
    Trash2,
    UserCheck,
    Activity,
    Stethoscope,
    ChevronRight,
    Loader2,
    X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getManagerDoctors, createManagerDoctor, deleteManagerDoctor } from '@/api/management'
import { useTenant } from '@/context/TenantContext'
import { CustomInput } from '@/components/CustomInput'
import { toastService } from '@/services/toast'
import { createPortal } from 'react-dom'

export function ManageDoctor() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        specialty: '',
        licenseNumber: '',
        bio: ''
    })

    const { data: realDoctors, isLoading } = useQuery({
        queryKey: ['manager-doctors', headers?.tenantId],
        queryFn: () => getManagerDoctors(headers),
        enabled: !!headers?.tenantId
    })

    const createMutation = useMutation({
        mutationFn: (data: any) => createManagerDoctor(data, headers),
        onSuccess: () => {
            toastService.success('Đã thêm bác sĩ mới thành công')
            setIsAddModalOpen(false)
            setFormData({ fullName: '', email: '', password: '', phone: '', specialty: '', licenseNumber: '', bio: '' })
            queryClient.invalidateQueries({ queryKey: ['manager-doctors'] })
            queryClient.invalidateQueries({ queryKey: ['manager-summary'] })
        },
        onError: (err: any) => {
            toastService.error(err.response?.data?.message || 'Lỗi khi thêm bác sĩ')
        }
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        createMutation.mutate(formData)
    }

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteManagerDoctor(id, headers),
        onSuccess: () => {
            toastService.success('Đã xóa hồ sơ bác sĩ thành công')
            queryClient.invalidateQueries({ queryKey: ['manager-doctors'] })
            queryClient.invalidateQueries({ queryKey: ['manager-summary'] })
        },
        onError: () => {
            toastService.error('Lỗi khi xóa bác sĩ')
        }
    })

    const filteredDoctors = useMemo(() => {
        if (!realDoctors) return []
        return realDoctors.filter(doc => 
            doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [realDoctors, searchTerm])

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa bác sĩ ${name}? Hành động này không thể hoàn tác.`)) {
            deleteMutation.mutate(id)
        }
    }

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Đang tải danh sách bác sĩ đội ngũ...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-600/10 rounded-2xl text-emerald-600">
                        <Users className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            Quản lý Bác sĩ Enterprise
                        </h1>
                        <p className="text-slate-500 font-bold mt-1 text-sm">
                            Hệ thống quản lý định danh và chuyên môn đội ngũ bác sĩ phòng khám.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4 text-emerald-600" />
                        Xuất danh bạ
                    </button>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <UserPlus className="w-4 h-4" />
                        Thêm bác sĩ CDM
                    </button>
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && createPortal(
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 z-10"
                        >
                            <form onSubmit={handleCreate} className="flex flex-col h-full max-h-[90vh]">
                                <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                                            <UserPlus className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">THÊM BÁC SĨ MỚI</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Thiết lập tài khoản & chuyên môn</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <CustomInput
                                            label="Họ và tên"
                                            required
                                            value={formData.fullName}
                                            onChange={(val: string) => setFormData({ ...formData, fullName: val })}
                                        />
                                        <CustomInput
                                            label="Email (Username)"
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(val: string) => setFormData({ ...formData, email: val })}
                                        />
                                        <CustomInput
                                            label="Mật khẩu ban đầu"
                                            required
                                            type="password"
                                            value={formData.password}
                                            onChange={(val: string) => setFormData({ ...formData, password: val })}
                                        />
                                        <CustomInput
                                            label="Số điện thoại"
                                            value={formData.phone}
                                            onChange={(val: string) => setFormData({ ...formData, phone: val })}
                                        />
                                        <CustomInput
                                            label="Chuyên khoa"
                                            required
                                            placeholder="VD: Tim mạch, Nội tiết..."
                                            value={formData.specialty}
                                            onChange={(val: string) => setFormData({ ...formData, specialty: val })}
                                        />
                                        <CustomInput
                                            label="Mã CCHN"
                                            value={formData.licenseNumber}
                                            onChange={(val: string) => setFormData({ ...formData, licenseNumber: val })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Giới thiệu ngắn</label>
                                        <textarea
                                            rows={3}
                                            className="w-full p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800 border-none text-sm font-bold resize-none"
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex justify-end gap-4 bg-slate-50/30">
                                    <button 
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="px-10 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3"
                                    >
                                        {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Lưu hồ sơ đội ngũ
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bác sĩ theo tên, chuyên khoa hoặc mã chứng chỉ hành nghề..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-600/20 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Doctor List Table */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-6">Bác sĩ & Thông tin</th>
                                        <th className="px-8 py-6">Chuyên khoa</th>
                                        <th className="px-8 py-6">Số CCHN</th>
                                        <th className="px-8 py-6 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {(filteredDoctors || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic">
                                                Không tìm thấy bác sĩ nào khớp với tìm kiếm của bạn.
                                            </td>
                                        </tr>
                                    ) : (filteredDoctors || []).map((doc: any) => (
                                        <tr key={doc.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-black text-emerald-600 text-lg shadow-sm">
                                                        {doc.fullName?.charAt(0) || 'D'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white text-base tracking-tight">{doc.fullName}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{doc.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                                    {doc.specialty || 'Đang cập nhật'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                {doc.licenseNumber || '—'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-emerald-600 transition-all active:scale-90" title="Chỉnh sửa">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(doc.id, doc.fullName)}
                                                        disabled={deleteMutation.isPending}
                                                        className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500 transition-all active:scale-90" 
                                                        title="Xóa"
                                                    >
                                                        {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pending Assignments - Enterprise AI View */}
                    <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-emerald-600/10 rounded-full blur-3xl" />
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h3 className="font-black text-white flex items-center gap-3 uppercase text-sm tracking-widest">
                                    <UserCheck className="w-5 h-5 text-emerald-500" />
                                    Điều phối AI bận rộn
                                </h3>
                                <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest leading-relaxed">
                                    Tự động cân bằng khối lượng công việc cho đội ngũ nội trú.
                                </p>
                            </div>
                            <button className="bg-emerald-600 text-white text-[10px] px-6 py-2.5 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">
                                Cấu hình điều phối
                            </button>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex flex-col items-center justify-center py-10 text-slate-500 opacity-60 bg-white/5 rounded-3xl border border-white/10">
                                <Activity className="w-8 h-8 mb-2 text-emerald-500" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-center">Hệ thống đang hoạt động ổn định</p>
                                <p className="text-[9px] font-bold text-center mt-1">Hiện không có yêu cầu điều phối bác sĩ khẩn cấp nào từ hệ thống AI.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workload Analytics Sidebar */}
                <div className="flex flex-col gap-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-black text-slate-900 dark:text-white mb-8 uppercase text-xs tracking-widest flex items-center gap-3">
                            <Stethoscope className="w-5 h-5 text-emerald-600" />
                            Phân tích năng lực
                        </h3>
                        <div className="flex flex-col gap-8">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hiệu suất vận hành</span>
                                    <span className="text-sm font-black text-emerald-600">82%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '82%' }}
                                        transition={{ duration: 1.5 }}
                                        className="h-full bg-emerald-600 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 group hover:bg-emerald-600 transition-all cursor-default">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-emerald-100">Đội ngũ hiện tại</p>
                                    <p className="text-2xl font-black text-emerald-600 group-hover:text-white">{(realDoctors || []).length}</p>
                                </div>
                                <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 group hover:bg-blue-600 transition-all cursor-default text-right">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-blue-100">Kế hoạch tuyển</p>
                                    <p className="text-2xl font-black text-blue-600 group-hover:text-white">03</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-white" />
                            <h3 className="font-black uppercase text-xs tracking-widest">Hệ thống gợi ý AI</h3>
                        </div>
                        <p className="text-sm font-bold text-emerald-50/90 leading-relaxed mb-8">
                            Dựa trên báo cáo tháng trước, phòng khám đang thiếu hụt bác sĩ khoa <span className="text-white underline decoration-white/30 underline-offset-4">Tim mạch</span> vào các khung giờ cao điểm từ 09:00 - 11:00 hàng ngày.
                        </p>
                        <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2">
                            Mô phỏng điều phối
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
