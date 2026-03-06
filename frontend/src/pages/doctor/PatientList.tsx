import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrescriptionModal } from '@/components/modals/PrescriptionModal'
import { AppointmentModal } from '@/components/modals/AppointmentModal'
import { ChevronDown, Plus, Loader2, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTenant } from '@/context/TenantContext'
import { useQuery } from '@tanstack/react-query'
import { getDoctorPatientList } from '@/api/doctor'
import type { PatientDto } from '@/types/api'

export function PatientList() {
    const navigate = useNavigate()
    const { headers, tenantId } = useTenant()
    const [selectedRisk, setSelectedRisk] = useState<string | null>(null)
    const [selectedDisease, setSelectedDisease] = useState('Tất cả loại bệnh')
    const [isDiseaseDropdownOpen, setIsDiseaseDropdownOpen] = useState(false)
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
    const [selectedPatientName, setSelectedPatientName] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const pageSize = 10

    // ─── Fetch Real Data ───
    const { data: patientPage, isLoading } = useQuery({
        queryKey: ['doctor-patient-list', tenantId, currentPage, pageSize],
        queryFn: () => getDoctorPatientList(headers, currentPage, pageSize),
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

    return (
        <div className="font-display bg-background-light dark:bg-background-dark p-8">
            {/* Filters Section */}
            <div className="flex flex-wrap items-center gap-6 mb-10">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 mr-2">Mức độ nguy cơ:</span>
                    <div className="flex gap-2 pr-2">
                        <button
                            onClick={() => setSelectedRisk(selectedRisk === 'Nguy cơ cao' ? null : 'Nguy cơ cao')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${selectedRisk === 'Nguy cơ cao' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                        >
                            Nguy cơ cao
                        </button>
                        <button
                            onClick={() => setSelectedRisk(selectedRisk === 'Cần theo dõi' ? null : 'Cần theo dõi')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${selectedRisk === 'Cần theo dõi' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-amber-50 text-amber-500 hover:bg-amber-100'}`}
                        >
                            Cần theo dõi
                        </button>
                        <button
                            onClick={() => setSelectedRisk(selectedRisk === 'Bình thường' ? null : 'Bình thường')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tighter ${selectedRisk === 'Bình thường' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100'}`}
                        >
                            Bình thường
                        </button>
                    </div>
                </div>

                <div className="relative group">
                    <button
                        onClick={() => setIsDiseaseDropdownOpen(!isDiseaseDropdownOpen)}
                        className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary transition-all cursor-pointer min-w-[240px]"
                    >
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Loại bệnh:</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 text-left">{selectedDisease}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDiseaseDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDiseaseDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden py-1"
                            >
                                {['Tất cả loại bệnh', 'Tiểu đường', 'Cao huyết áp', 'Tim mạch', 'Bệnh thận', 'Phổi tắc nghẽn'].map((disease) => (
                                    <button
                                        key={disease}
                                        onClick={() => {
                                            setSelectedDisease(disease)
                                            setIsDiseaseDropdownOpen(false)
                                        }}
                                        className="w-full px-6 py-3 text-left hover:bg-primary/10 transition-colors flex items-center justify-between group/item"
                                    >
                                        <span className={`text-sm font-bold ${selectedDisease === disease ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {disease}
                                        </span>
                                        {selectedDisease === disease && (
                                            <div className="size-2 bg-primary rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button className="ml-auto flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>Thêm bệnh nhân</span>
                </button>
            </div>

            {/* Loading State */}
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
            ) : (
                /* Patient Table */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bệnh nhân</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Giới tính</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SĐT</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cập nhật</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {patients.map((patient, idx) => (
                                    <motion.tr
                                        key={patient.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/patients/${patient.id}/ehr`)}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center">
                                                    {patient.avatarUrl ? (
                                                        <img alt={patient.fullNameVi} className="w-full h-full object-cover" src={patient.avatarUrl} />
                                                    ) : (
                                                        <span className="font-black text-slate-400 text-sm">
                                                            {patient.fullNameVi?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{patient.fullNameVi}</span>
                                                    <span className="text-xs text-slate-500">{calculateAge(patient.dateOfBirth)} tuổi</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${patient.gender === 'MALE' ? 'bg-blue-50 text-blue-600 border-blue-200' : patient.gender === 'FEMALE' ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : patient.gender || '–'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {patient.phone || '–'}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500 truncate max-w-[200px]">
                                            {patient.email || '–'}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs text-slate-400">{formatUpdate(patient.updatedAt)}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
                                                        setSelectedPatientName(patient.fullNameVi)
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
                                                        setSelectedPatientName(patient.fullNameVi)
                                                        setIsPrescriptionModalOpen(true)
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined text-xl">description</span>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
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
            />

            <AppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                patientName={selectedPatientName}
            />
        </div>
    )
}
