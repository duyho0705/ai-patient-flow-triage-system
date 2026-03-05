import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface PrescriptionModalProps {
    isOpen: boolean
    onClose: () => void
    patientName?: string
}

export function PrescriptionModal({ isOpen, onClose, patientName = 'Nguyễn Văn A' }: PrescriptionModalProps) {
    const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false)

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <div className="fixed inset-0" onClick={() => {
                onClose()
                setIsAddMedicationOpen(false)
            }} />

            {/* Unified Modal Container - Full Width Centered */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    width: isAddMedicationOpen ? 'min(1600px, 98vw)' : 'min(896px, 95vw)',
                    gap: isAddMedicationOpen ? '1rem' : '0'
                }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative flex flex-row items-center justify-center max-h-[96vh] z-10 w-full overflow-visible"
            >
                {/* Left Panel: Prescription Form */}
                <div className={`flex flex-col bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${isAddMedicationOpen ? 'w-[49%] h-auto max-h-[94vh]' : 'w-full h-auto max-h-[90vh]'}`}>
                    {/* Modal Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 py-4 min-h-[73px]">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                                <span className="material-symbols-outlined text-2xl">description</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Kê đơn thuốc mới</h2>
                        </div>
                        <button
                            onClick={() => {
                                onClose()
                                setIsAddMedicationOpen(false)
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-500"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-hide">
                        {/* Patient & Diagnosis Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bệnh nhân</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-xl">search</span>
                                    </div>
                                    <select
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-primary/5 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-0 focus:border-primary outline-none transition-all appearance-none text-slate-900 dark:text-white font-medium"
                                        defaultValue={patientName}
                                    >
                                        <option>{patientName}</option>
                                        <option>Trần Thị B</option>
                                        <option>Lê Văn C</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chẩn đoán hiện tại</label>
                                <input
                                    type="text"
                                    defaultValue="Viêm họng cấp / Theo dõi đái tháo đường"
                                    className="w-full px-4 py-3 rounded-lg border-2 border-primary/5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-0 focus:border-primary outline-none transition-all text-slate-900 dark:text-white font-medium"
                                    placeholder="Nhập chẩn đoán..."
                                />
                            </div>
                        </div>

                        {/* Medication List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">pill</span>
                                    Danh sách thuốc
                                </h3>
                                {!isAddMedicationOpen && (
                                    <button
                                        onClick={() => setIsAddMedicationOpen(true)}
                                        className="flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all active:scale-[0.98]"
                                    >
                                        <span className="material-symbols-outlined text-xl">add_circle</span>
                                        Thêm thuốc
                                    </button>
                                )}
                            </div>
                            <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                                        <tr>
                                            <th className="px-5 py-4">Tên thuốc & Hàm lượng</th>
                                            <th className="px-5 py-4">Liều dùng</th>
                                            <th className="px-5 py-4">Tần suất</th>
                                            <th className="px-5 py-4">Thời gian</th>
                                            <th className="px-5 py-4 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {[
                                            { name: 'Metformin 500mg', note: 'Uống sau khi ăn', dose: '1 viên', freq: 'Sáng 1, Tối 1', duration: '30 ngày' },
                                            { name: 'Paracetamol 500mg', note: 'Khi sốt trên 38.5 độ', dose: '1 viên', freq: 'Cách 4-6 giờ', duration: '5 ngày' }
                                        ].map((med, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">{med.name}</div>
                                                    <div className="text-[11px] font-medium text-slate-400 group-hover:text-slate-500">{med.note}</div>
                                                </td>
                                                <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{med.dose}</td>
                                                <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{med.freq}</td>
                                                <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-white">{med.duration}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                                                        <span className="material-symbols-outlined text-xl">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notes & Follow-up Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-xl">edit_note</span>
                                    Ghi chú dược sĩ/bệnh nhân
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Nhập lời dặn thêm..."
                                    className="w-full px-4 py-2.5 rounded-lg border-2 border-primary/5 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:ring-0 focus:border-primary outline-none transition-all resize-none text-slate-900 dark:text-white font-medium"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10 transition-all hover:bg-primary/10">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-2xl">event_repeat</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Hẹn tái khám</p>
                                            <p className="text-[10px] font-medium text-slate-500">Tự động nhắc lịch cho bệnh nhân</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </label>
                                </div>
                                <div className="space-y-1 px-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày tái khám dự kiến</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-xl">calendar_today</span>
                                        </div>
                                        <input
                                            type="date"
                                            defaultValue="2023-12-25"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-primary/5 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-0 focus:border-primary outline-none transition-all text-slate-900 dark:text-white cursor-pointer font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 px-8 py-5 flex items-center justify-end gap-3 z-10">
                        <button
                            onClick={() => {
                                onClose()
                                setIsAddMedicationOpen(false)
                            }}
                            className="px-6 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => {
                                onClose()
                                setIsAddMedicationOpen(false)
                            }}
                            className="px-8 py-2.5 rounded-xl font-black bg-primary text-slate-900 hover:shadow-[0_8px_20px_-4px_rgba(74,222,128,0.4)] transition-all active:scale-[0.98] flex items-center gap-2 group"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:translate-x-0.5 transition-transform">send</span>
                            Lưu & Gửi
                        </button>
                    </div>
                </div>

                {/* Connecting Arrow */}
                <AnimatePresence>
                    {isAddMedicationOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="flex items-center justify-center self-center"
                        >
                            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-2xl rounded-full p-2.5 text-primary border-4 border-white dark:border-slate-900 z-20">
                                <span className="material-symbols-outlined text-3xl font-bold">arrow_forward</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right Panel: Add Medication Detail Form */}
                <AnimatePresence>
                    {isAddMedicationOpen && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 250 }}
                            className="w-[49%] h-auto max-h-[94vh] bg-white dark:bg-slate-900 flex flex-col shadow-2xl rounded-2xl overflow-hidden"
                        >
                            {/* Child Header */}
                            <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md min-h-[73px]">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-2.5 rounded-lg text-primary">
                                        <span className="material-symbols-outlined text-2xl">prescriptions</span>
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Thêm thuốc vào danh sách</h2>
                                </div>
                                <button
                                    onClick={() => setIsAddMedicationOpen(false)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors text-slate-400 hover:text-red-500"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </header>

                            {/* Child Content Area */}
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-hide">
                                <div className="space-y-4">
                                    {/* Search Medication */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên thuốc</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary group-focus-within:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-xl">pill</span>
                                            </div>
                                            <input
                                                className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-800 border-2 border-primary/10 focus:border-primary focus:ring-0 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all font-bold"
                                                placeholder="Tìm kiếm tên thuốc..."
                                                type="text"
                                            />
                                        </div>
                                    </div>

                                    {/* Dosage & Frequency */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Liều dùng</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-xl">medication</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-800 border-2 border-primary/10 focus:border-primary focus:ring-0 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-bold"
                                                    placeholder="Ví dụ: 1 viên"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tần suất</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-xl">repeat</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-800 border-2 border-primary/10 focus:border-primary focus:ring-0 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-bold"
                                                    placeholder="Ví dụ: Sáng 1, Tối 1"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration & Start Date */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Thời gian</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-xl">schedule</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-800 border-2 border-primary/10 focus:border-primary focus:ring-0 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-bold"
                                                    placeholder="Ví dụ: 30 ngày"
                                                    type="text"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngày bắt đầu</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-xl">calendar_today</span>
                                                </div>
                                                <input
                                                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-800 border-2 border-primary/10 focus:border-primary focus:ring-0 rounded-lg text-slate-900 dark:text-slate-100 font-bold"
                                                    type="date"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ghi chú hướng dẫn</label>
                                        <div className="relative group">
                                            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-xl">edit_note</span>
                                            </div>
                                            <textarea
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-primary/10 focus:border-primary focus:ring-0 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none font-medium"
                                                placeholder="Ghi chú: Uống sau khi ăn..."
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Alert */}
                                <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg flex gap-3">
                                    <span className="material-symbols-outlined text-primary text-xl">info</span>
                                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                                        Hãy chắc chắn rằng thông tin thuốc khớp với đơn thuốc của bác sĩ. Liên hệ cơ sở y tế nếu có bất kỳ thắc mắc nào.
                                    </p>
                                </div>
                            </div>

                            {/* Child Footer Actions */}
                            <footer className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-primary/10 px-6 py-4 flex items-center justify-end gap-3 z-10">
                                <button
                                    onClick={() => setIsAddMedicationOpen(false)}
                                    className="px-5 py-2 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={() => setIsAddMedicationOpen(false)}
                                    className="px-7 py-2 bg-primary text-slate-900 rounded-xl font-black hover:shadow-[0_8px_20px_-4px_rgba(74,222,128,0.4)] transition-all active:scale-[0.98] flex items-center gap-2 group"
                                >
                                    <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">add_circle</span>
                                    Thêm vào danh sách
                                </button>
                            </footer>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>,
        document.body
    )
}
