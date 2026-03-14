import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPatient } from '@/api/doctor';
import { useTenant } from '@/context/TenantContext';
import { Loader2 } from 'lucide-react';
import { toastService } from '@/services/toast';

interface PatientAddModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PatientAddModal({ isOpen, onClose }: PatientAddModalProps) {
    const { headers } = useTenant();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        fullNameVi: '',
        dateOfBirth: '',
        phone: '',
        gender: 'male',
        roleDisease: 'Tiểu đường',
        riskLevel: 'normal',
        chronicConditions: ''
    });

    const mutation = useMutation({
        mutationFn: (data: any) => createPatient(data, headers),
        onSuccess: () => {
            toastService.success("Thêm bệnh nhân thành công!");
            queryClient.invalidateQueries({ queryKey: ['doctor-patient-list'] });
            setFormData({
                fullNameVi: '',
                dateOfBirth: '',
                phone: '',
                gender: 'male',
                roleDisease: 'Tiểu đường',
                riskLevel: 'normal',
                chronicConditions: ''
            });
            onClose();
        },
        onError: (error: any) => {
            toastService.error(error?.message || "Có lỗi xảy ra khi thêm bệnh nhân!");
        }
    });

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!formData.fullNameVi || !formData.dateOfBirth || !formData.phone) {
            toastService.error("Vui lòng điền đầy đủ các trường bắt buộc (*)");
            return;
        }

        let mappedRisk = "LOW";
        if (formData.riskLevel === 'warning') mappedRisk = "MEDIUM";
        if (formData.riskLevel === 'danger') mappedRisk = "HIGH";

        const mappedDisease = formData.roleDisease !== 'Khác' ? formData.roleDisease : '';
        const finalConditions = mappedDisease + (formData.chronicConditions ? (mappedDisease ? `\nChẩn đoán: ${formData.chronicConditions}` : formData.chronicConditions) : '');

        mutation.mutate({
            fullNameVi: formData.fullNameVi,
            dateOfBirth: formData.dateOfBirth,
            phone: formData.phone,
            gender: formData.gender,
            riskLevel: mappedRisk,
            chronicConditions: finalConditions
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-display">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/40 transition-opacity"
                onClick={onClose}
            ></div>
            
            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-primary/5">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Thêm bệnh nhân mới</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Nhập đầy đủ thông tin để khởi tạo hồ sơ bệnh án
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        disabled={mutation.isPending}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mã bệnh nhân</label>
                            <input
                                className="rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed px-4 py-2.5 outline-none"
                                disabled
                                placeholder="BT-2024-XXXX"
                                type="text"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="Nhập họ và tên đầy đủ"
                                type="text"
                                value={formData.fullNameVi}
                                onChange={e => setFormData({ ...formData, fullNameVi: e.target.value })}
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Ngày sinh <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                placeholder="0xxx xxx xxx"
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Giới tính</label>
                            <div className="flex gap-4 items-center h-full">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        className="w-4 h-4 text-primary focus:ring-primary bg-white dark:bg-slate-800 border-slate-300 cursor-pointer"
                                        name="gender" 
                                        type="radio" 
                                        value="male"
                                        checked={formData.gender === 'male'}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-medium transition-colors">Nam</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        className="w-4 h-4 text-primary focus:ring-primary bg-white dark:bg-slate-800 border-slate-300 cursor-pointer"
                                        name="gender" 
                                        type="radio" 
                                        value="female"
                                        checked={formData.gender === 'female'}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-medium transition-colors">Nữ</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        className="w-4 h-4 text-primary focus:ring-primary bg-white dark:bg-slate-800 border-slate-300 cursor-pointer"
                                        name="gender" 
                                        type="radio" 
                                        value="other"
                                        checked={formData.gender === 'other'}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-medium transition-colors">Khác</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Loại bệnh</label>
                            <select 
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none font-medium cursor-pointer"
                                value={formData.roleDisease}
                                onChange={e => setFormData({ ...formData, roleDisease: e.target.value })}
                            >
                                <option>Tiểu đường</option>
                                <option>Cao huyết áp</option>
                                <option>Tim mạch</option>
                                <option>Hô hấp</option>
                                <option>Khác</option>
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mức độ nguy cơ</label>
                            <div className="flex flex-wrap p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <label className="flex-1">
                                    <input 
                                        className="sr-only peer" 
                                        name="risk" 
                                        type="radio" 
                                        value="normal" 
                                        checked={formData.riskLevel === 'normal'}
                                        onChange={e => setFormData({ ...formData, riskLevel: e.target.value })}
                                    />
                                    <div className="flex items-center justify-center py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-emerald-500 peer-checked:shadow-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                        Bình thường
                                    </div>
                                </label>
                                <label className="flex-1">
                                    <input 
                                        className="sr-only peer" 
                                        name="risk" 
                                        type="radio" 
                                        value="warning" 
                                        checked={formData.riskLevel === 'warning'}
                                        onChange={e => setFormData({ ...formData, riskLevel: e.target.value })}
                                    />
                                    <div className="flex items-center justify-center py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-orange-500 peer-checked:shadow-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                        Cần theo dõi
                                    </div>
                                </label>
                                <label className="flex-1">
                                    <input 
                                        className="sr-only peer" 
                                        name="risk" 
                                        type="radio" 
                                        value="danger" 
                                        checked={formData.riskLevel === 'danger'}
                                        onChange={e => setFormData({ ...formData, riskLevel: e.target.value })}
                                    />
                                    <div className="flex items-center justify-center py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-red-500 peer-checked:shadow-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                        Nguy cơ cao
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Chẩn đoán ban đầu
                            </label>
                            <textarea
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-400"
                                placeholder="Nhập nội dung chẩn đoán hoặc ghi chú quan trọng..."
                                rows={3}
                                value={formData.chronicConditions}
                                onChange={e => setFormData({ ...formData, chronicConditions: e.target.value })}
                            ></textarea>
                        </div>
                        
                        {/* Hidden submit button to allow Enter key to submit form */}
                        <button type="submit" className="hidden" disabled={mutation.isPending}>Submit</button>
                    </form>
                </div>
                
                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        disabled={mutation.isPending}
                        className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={() => handleSubmit()}
                        disabled={mutation.isPending}
                        className="px-8 py-2.5 bg-primary text-slate-900 font-extrabold rounded-xl hover:brightness-110 shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            'Thêm bệnh nhân'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
