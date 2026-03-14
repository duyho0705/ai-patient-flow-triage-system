import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'
import { AppointmentModal } from '@/components/modals/AppointmentModal'
import { PatientAddModal } from '@/components/modals/PatientAddModal'
import { Loader2, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTenant } from '@/context/TenantContext'
import { useQuery } from '@tanstack/react-query'
import { getDoctorPatientList } from '@/api/doctor'
import type { PatientDto } from '@/api-client'

export function PatientList() {
    const navigate = useNavigate()
    const { headers, tenantId } = useTenant()
    const [selectedRisk, setSelectedRisk] = useState<string | null>(null)
    const [selectedDisease, setSelectedDisease] = useState('Tất cả loại bệnh')
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false)
    const [selectedPatientName, setSelectedPatientName] = useState('')
    const [selectedPatientId, setSelectedPatientId] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const [searchText, setSearchText] = useState('')
    const pageSize = 10

    // ─── Map UI labels to backend values ───
    const riskLabelToBackend: Record<string, string> = {
        'Nguy cơ cao': 'HIGH',
        'Cần theo dõi': 'MEDIUM',
        'Bình thường': 'LOW'
    }
    const backendRiskLevel = selectedRisk ? riskLabelToBackend[selectedRisk] || undefined : undefined
    const backendChronicCondition = selectedDisease !== 'Tất cả loại bệnh' ? selectedDisease : undefined

    // ─── Fetch Real Data (server-side search + filter) ───
    const { data: patientPage, isLoading } = useQuery({
        queryKey: ['doctor-patient-list', tenantId, currentPage, pageSize, searchText, backendRiskLevel, backendChronicCondition],
        queryFn: () => getDoctorPatientList(headers, currentPage, pageSize, searchText || undefined, backendRiskLevel, backendChronicCondition),
        enabled: !!tenantId
    })

    const patients: PatientDto[] = patientPage?.content || []
    const totalElements = patientPage?.totalElements || 0
    const totalPages = patientPage?.totalPages || 1

    // ─── Helper: Calculate age from dateOfBirth ───
    const calculateAge = (dob?: string) => {
        if (!dob) return '–'
        const birth = new Date(dob)
        const diff = Date.now() - birth.getTime()
        return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
    }

    // ─── Helper: Format date for "last update" column ───
    const formatUpdate = (dateStr?: string) => {
        if (!dateStr) return '–'
        const d = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - d.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 1) return 'Vừa xong'
        if (diffMins < 60) return `${diffMins} phút trước`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours} giờ trước`
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    // ─── Pagination helpers ───
    const getPageNumbers = () => {
        const pages: (number | '...')[] = []
        if (totalPages <= 5) {
            for (let i = 0; i < totalPages; i++) pages.push(i)
        } else {
            pages.push(0)
            if (currentPage > 2) pages.push('...')
            for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
                pages.push(i)
            }
            if (currentPage < totalPages - 3) pages.push('...')
            pages.push(totalPages - 1)
        }
        return pages
    }

    // ─── Real Data Mappers (for display) ───
    const getRiskStatus = (riskLevel?: string) => {
        switch (riskLevel?.toUpperCase()) {
            case 'HIGH':
            case 'CRITICAL':
                return { label: 'Nguy cơ cao', classes: 'bg-red-100 text-red-600' };
            case 'MEDIUM':
                return { label: 'Cần theo dõi', classes: 'bg-orange-100 text-orange-500' };
            default:
                return { label: 'Bình thường', classes: 'bg-emerald-100 text-emerald-600' };
        }
    }

    const getDisease = (chronicConditions?: string) => {
        return chronicConditions || '–';
    }

    // Reset page when filter changes
    const handleRiskFilter = (risk: string) => {
        setSelectedRisk(selectedRisk === risk ? null : risk)
        setCurrentPage(0)
    }
    const handleDiseaseFilter = (disease: string) => {
        setSelectedDisease(disease)
        setCurrentPage(0)
    }

    return (
        <div className="font-display bg-background-light dark:bg-background-dark p-8 flex-1 overflow-y-auto">

            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {/* Search */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 h-[40px]">
                    <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Tìm theo tên bệnh nhân..."
                        value={searchText}
                        onChange={(e) => { setSearchText(e.target.value); setCurrentPage(0); }}
                        className="bg-transparent border-none text-sm text-slate-800 focus:ring-0 outline-none w-[200px] placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-slate-200">
                    <span className="pl-3 pr-1 text-xs font-medium text-slate-400">MỨC ĐỘ NGUY CƠ:</span>
                    <button
                        onClick={() => handleRiskFilter('Nguy cơ cao')}
                        className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${selectedRisk === 'Nguy cơ cao' ? 'bg-red-500 text-white shadow-sm' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                    >
                        Nguy cơ cao
                    </button>
                    <button
                        onClick={() => handleRiskFilter('Cần theo dõi')}
                        className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${selectedRisk === 'Cần theo dõi' ? 'bg-orange-500 text-white shadow-sm' : 'bg-orange-100 text-orange-500 hover:bg-orange-200'}`}
                    >
                        Cần theo dõi
                    </button>
                    <button
                        onClick={() => handleRiskFilter('Bình thường')}
                        className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${selectedRisk === 'Bình thường' ? 'bg-[#22c55e] text-white shadow-sm' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                    >
                        Bình thường
                    </button>
                </div>

                <div className="flex items-center gap-1.5 bg-white py-1 pl-4 pr-2 rounded-full border border-slate-200 h-[40px]">
                    <span className="text-xs font-medium text-slate-400">LOẠI BỆNH:</span>
                    <select
                        value={selectedDisease}
                        onChange={(e) => handleDiseaseFilter(e.target.value)}
                        className="bg-transparent border-none text-sm font-semibold text-slate-800 focus:ring-0 py-0 pl-1 pr-6 cursor-pointer outline-none w-[160px]"
                    >
                        <option>Tất cả loại bệnh</option>
                        <option>Tiểu đường</option>
                        <option>Cao huyết áp</option>
                        <option>Tim mạch</option>
                    </select>
                </div>

                <button 
                    onClick={() => setIsAddPatientModalOpen(true)}
                    className="ml-auto flex items-center gap-2 px-6 py-2 bg-[#4ade80] text-white font-semibold rounded-full hover:bg-green-500 transition-colors h-[40px] shadow-sm"
                >
                    <span className="material-symbols-outlined text-xl">person_add</span>
                    <span className="text-sm">Thêm bệnh nhân</span>
                </button>
            </div>

            {/* Loading & Empty States */}
            {isLoading ? (
                <div className="h-[40vh] flex flex-col items-center justify-center gap-4 text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                    <p className="font-bold text-sm uppercase tracking-widest">Đang tải danh sách bệnh nhân...</p>
                </div>
            ) : patients.length === 0 ? (
                <div className="h-[40vh] flex flex-col items-center justify-center gap-4 text-slate-400">
                    <Users className="w-12 h-12 opacity-20" />
                    <p className="font-bold text-sm">Chưa có bệnh nhân nào</p>
                </div>
            ) : patients.length === 0 && (searchText || selectedRisk || selectedDisease !== 'Tất cả loại bệnh') ? (
                <div className="h-[40vh] flex flex-col items-center justify-center gap-4 text-slate-400">
                    <Users className="w-12 h-12 opacity-20" />
                    <p className="font-bold text-sm">Không tìm thấy bệnh nhân nào phù hợp với bộ lọc</p>
                </div>
            ) : (
                /* Patient Table */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Bệnh nhân</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Loại bệnh</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Liên hệ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cập nhật</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {patients.map((patient: PatientDto, idx: number) => {
                                        const riskStatus = getRiskStatus(patient.riskLevel);

                                    return (
                                        <motion.tr
                                            key={patient.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/patients/${patient.id}/ehr`)}
                                        >
                                            <td className="px-6 py-4 border-b border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                                        {patient.avatarUrl ? (
                                                            <img alt={patient.fullNameVi} className="w-full h-full object-cover" src={patient.avatarUrl} />
                                                        ) : (
                                                            <span className="font-bold text-slate-400">
                                                                {patient.fullNameVi?.charAt(0)?.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{patient.fullNameVi}</div>
                                                        <div className="text-xs text-slate-500">{calculateAge(patient.dateOfBirth)} tuổi</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-100">
                                                <div className="font-medium text-slate-700 dark:text-slate-300">{getDisease(patient.chronicConditions)}</div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-100">
                                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                                    {patient.phone || '–'}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : patient.gender || '–'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-100">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskStatus.classes}`}>
                                                    {riskStatus.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-100">
                                                <span className="text-xs text-slate-500">{formatUpdate(patient.updatedAt)}</span>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-100 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/20 hover:text-primary transition-all text-slate-500"
                                                        title="Xem chi tiết"
                                                        onClick={() => navigate(`/patients/${patient.id}/ehr`)}
                                                    >
                                                        <span className="material-symbols-outlined text-xl">visibility</span>
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/20 hover:text-primary transition-all text-slate-500"
                                                        title="Đặt lịch tái khám"
                                                        onClick={() => {
                                                            setSelectedPatientName(patient.fullNameVi || '')
                                                            setSelectedPatientId(patient.id || '')
                                                            setIsAppointmentModalOpen(true)
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-xl">event_available</span>
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/20 hover:text-primary transition-all text-slate-500"
                                                        title="Nhắn tin"
                                                        onClick={() => navigate('/chat')}
                                                    >
                                                        <span className="material-symbols-outlined text-xl">chat</span>
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/20 hover:text-primary transition-all text-slate-500"
                                                        title="Kê đơn thuốc điện tử"
                                                        onClick={() => {
                                                            setSelectedPatientName(patient.fullNameVi || '')
                                                            setSelectedPatientId(patient.id || '')
                                                            setIsPrescriptionModalOpen(true)
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-xl">description</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Real Pagination */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-500 font-medium">
                            Hiển thị {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, totalElements)} trên {totalElements} bệnh nhân
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                className="size-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {getPageNumbers().map((page, idx) =>
                                page === '...' ? (
                                    <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page as number)}
                                        className={`size-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${currentPage === page
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-primary/10 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        {(page as number) + 1}
                                    </button>
                                )
                            )}
                            <button
                                className="size-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-primary/10 transition-colors"
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PrescriptionModal
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                patientName={selectedPatientName}
                patientId={selectedPatientId}
            />

            <AppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                patientName={selectedPatientName}
                patientId={selectedPatientId}
            />

            <PatientAddModal 
                isOpen={isAddPatientModalOpen}
                onClose={() => setIsAddPatientModalOpen(false)}
            />
        </div>
    )
}
