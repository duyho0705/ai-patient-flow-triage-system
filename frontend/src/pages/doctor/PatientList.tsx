import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'
import { AppointmentModal } from '@/components/modals/AppointmentModal'
import { PatientAddModal } from '@/components/modals/PatientAddModal'
import { 
    Loader2, ChevronLeft, ChevronRight, 
    Search, UserPlus, FileText, Eye, 
    CalendarCheck, MessageCircle, MapPin, Phone
} from 'lucide-react'
import { useTenant } from '@/context/TenantContext'
import { useQuery } from '@tanstack/react-query'
import { getDoctorPatientList } from '@/api/doctor'
import { PatientDto } from '@/types/api'

const PAGE_SIZE = 10

export default function PatientList() {
    const navigate = useNavigate()
    const { headers } = useTenant()
    
    const [page, setPage] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedGender, setSelectedGender] = useState<string>('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['doctor-patients', searchTerm, selectedGender, page, headers?.tenantId],
        queryFn: () => getDoctorPatientList(
            headers,
            page,
            PAGE_SIZE,
            searchTerm || undefined,
            undefined, // riskLevel filter not added yet in UI
            undefined  // chronicCondition filter not added yet in UI
        ),
        enabled: !!headers?.tenantId,
    })

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 bg-md-background font-sans space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-md-on-surface tracking-tight">Patient Registry</h2>
                    <p className="text-md-on-surface-variant font-medium opacity-70">
                        Quản lý hồ sơ bệnh nhân và lịch sử can thiệp lâm sàng.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-8 py-3.5 bg-md-primary text-white rounded-full font-bold text-sm shadow-elevation-2 hover:shadow-elevation-4 transition-all active:scale-95 group"
                >
                    <UserPlus className="size-5 group-hover:scale-110 transition-transform" />
                    <span>Tiếp nhận Bệnh nhân</span>
                </button>
            </div>

            {/* Filters Area */}
            <div className="bg-md-surface-container rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-6 border border-md-outline/5 shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-md-on-surface-variant opacity-40 group-focus-within:text-md-primary group-focus-within:opacity-100 transition-all pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên bệnh nhân, mã hồ sơ hoặc số định danh..."
                        className="w-full h-16 pl-16 pr-8 bg-md-surface-container-low border border-md-outline/10 rounded-2xl text-sm font-bold text-md-on-surface outline-none focus:ring-4 focus:ring-md-primary/10 transition-all"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setPage(0)
                        }}
                    />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        className="h-16 px-8 bg-md-surface-container-low border border-md-outline/10 rounded-2xl text-sm font-bold text-md-on-surface outline-none cursor-pointer focus:ring-4 focus:ring-md-primary/10 transition-all appearance-none min-w-[160px]"
                        value={selectedGender}
                        onChange={(e) => {
                             setSelectedGender(e.target.value)
                             setPage(0)
                        }}
                    >
                        <option value="">Toàn bộ giới tính</option>
                        <option value="MALE">Nam giới</option>
                        <option value="FEMALE">Nữ giới</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>
            </div>

            {/* Patient Table Card */}
            <div className="bg-md-surface-container-lowest rounded-[3rem] border border-md-outline/10 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="size-12 animate-spin text-md-primary" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-md-on-surface-variant animate-pulse italic">Initializing Patient Core Synchronization...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-md-surface-container-low/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Bệnh nhân / Định danh</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Liên lạc</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60 text-center">Giới tính / Tuổi</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60 text-right">Thao tác lâm sàng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-md-outline/5">
                                    {(data?.content ?? []).map((patient: PatientDto, idx: number) => (
                                        <motion.tr
                                            key={patient.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-md-primary/5 transition-all group cursor-default"
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="size-14 rounded-2xl bg-md-surface-container flex items-center justify-center font-black text-md-primary border border-md-outline/10 group-hover:rotate-6 transition-transform">
                                                        {patient.fullNameVi?.charAt(0).toUpperCase() || 'P'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-bold text-md-on-surface group-hover:text-md-primary transition-colors">{patient.fullNameVi}</h4>
                                                        <p className="text-[11px] font-medium text-md-on-surface-variant opacity-60 italic mt-0.5">ID: {patient.id.substring(0,8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-md-on-surface">
                                                        <Phone size={14} className="opacity-40" />
                                                        {patient.phone || 'Không có số'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] font-medium text-md-on-surface-variant opacity-60">
                                                        <MapPin size={14} className="opacity-40" />
                                                        {patient.addressLine || 'Chưa cập nhật địa chỉ'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        patient.gender === 'MALE' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                        patient.gender === 'FEMALE' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        'bg-slate-50 text-slate-600 border border-slate-100'
                                                    }`}>
                                                        {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-md-on-surface mt-2 italic opacity-60">{patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} tuổi` : 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <ActionButton 
                                                        icon={Eye} 
                                                        color="primary" 
                                                        onClick={() => navigate(`/doctor/patients/${patient.id}`)} 
                                                        title="Xem hồ sơ" 
                                                    />
                                                    <ActionButton 
                                                        icon={CalendarCheck} 
                                                        color="success" 
                                                        onClick={() => { setSelectedPatient(patient); setIsAppointmentModalOpen(true); }} 
                                                        title="Đặt lịch khám" 
                                                    />
                                                    <ActionButton 
                                                        icon={FileText} 
                                                        color="amber" 
                                                        onClick={() => { setSelectedPatient(patient); setIsPrescriptionModalOpen(true); }} 
                                                        title="Kê đơn thuốc" 
                                                    />
                                                    <ActionButton 
                                                        icon={MessageCircle} 
                                                        color="primary" 
                                                        onClick={() => alert(`Chat với ${patient.fullNameVi}`)} 
                                                        title="Nhắn tin" 
                                                    />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Area */}
                        <div className="mt-auto p-10 bg-md-surface-container-low/30 border-t border-md-outline/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-[11px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-40">
                                Showing <span className="text-md-primary">{(data?.page ?? 0) * PAGE_SIZE + 1} - {Math.min(((data?.page ?? 0) + 1) * PAGE_SIZE, data?.totalElements ?? 0)}</span> of {data?.totalElements?.toLocaleString()} clinical records
                            </p>
                            <div className="flex items-center gap-3">
                                <PaginationButton 
                                    disabled={data?.first} 
                                    onClick={() => setPage(p => p - 1)} 
                                    icon={ChevronLeft} 
                                />
                                <div className="size-14 bg-md-primary text-white rounded-[1.2rem] flex items-center justify-center font-black text-lg shadow-elevation-2">
                                    {(data?.page ?? 0) + 1}
                                </div>
                                <PaginationButton 
                                    disabled={data?.last} 
                                    onClick={() => setPage(p => p + 1)} 
                                    icon={ChevronRight} 
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <PatientAddModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {selectedPatient && (
                <>
                    <PrescriptionModal
                        isOpen={isPrescriptionModalOpen}
                        onClose={() => setIsPrescriptionModalOpen(false)}
                        patientId={selectedPatient.id}
                        patientName={selectedPatient.fullNameVi}
                    />
                    <AppointmentModal
                        isOpen={isAppointmentModalOpen}
                        onClose={() => setIsAppointmentModalOpen(false)}
                        patientId={selectedPatient.id}
                        patientName={selectedPatient.fullNameVi}
                    />
                </>
            )}
        </div>
    )
}

function ActionButton({ icon: Icon, color, onClick, title }: any) {
    const colorStyles: any = {
        primary: 'bg-md-primary/10 text-md-primary hover:bg-md-primary hover:text-white',
        success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border-amber-100'
    }
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-3.5 rounded-2xl border border-transparent transition-all active:scale-90 shadow-sm ${colorStyles[color]}`}
        >
            <Icon size={18} />
        </button>
    )
}

function PaginationButton({ disabled, onClick, icon: Icon }: any) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="size-14 rounded-[1.2rem] bg-md-surface-container-low border border-md-outline/10 text-md-on-surface-variant hover:text-md-primary hover:bg-white transition-all shadow-sm active:scale-90 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
        >
            <Icon size={24} />
        </button>
    )
}
