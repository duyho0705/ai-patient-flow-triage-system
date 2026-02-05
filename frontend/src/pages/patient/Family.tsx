import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, UserPlus, ShieldCheck, ChevronRight, MoreVertical, Heart, Baby, UserCircle, X, Trash2, ChevronDown, Edit3, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPortalFamily, addPortalRelative, deletePortalRelative, updatePortalRelative } from '@/api/portal'
import { useTenant } from '@/context/TenantContext'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface RelationshipOption {
    label: string;
    icon: any;
}

const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
    { label: 'Bố/Mẹ', icon: Users },
    { label: 'Vợ/Chồng', icon: Heart },
    { label: 'Con trai', icon: Baby },
    { label: 'Con gái', icon: Baby },
    { label: 'Anh/Chị/Em', icon: UserCircle },
];

const AVATAR_COLORS = [
    'bg-blue-50 text-blue-600',
    'bg-emerald-50 text-emerald-600',
    'bg-violet-50 text-violet-600',
    'bg-amber-50 text-amber-600',
    'bg-rose-50 text-rose-600',
    'bg-cyan-50 text-cyan-600'
];

function RelationshipSelector({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const selected = RELATIONSHIP_OPTIONS.find(opt => opt.label === value) || RELATIONSHIP_OPTIONS[0];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all text-left"
            >
                <div className="flex items-center gap-3">
                    <selected.icon className="w-4 h-4 text-blue-600" />
                    <span>{selected.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-[120] top-full mt-2 w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden py-2"
                        >
                            {RELATIONSHIP_OPTIONS.map((opt) => (
                                <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.label);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors text-left ${value === opt.label ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                                        }`}
                                >
                                    <opt.icon className={`w-4 h-4 ${value === opt.label ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <span className="font-bold text-sm">{opt.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PatientFamily() {
    const { headers } = useTenant()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [newRelative, setNewRelative] = useState({
        fullName: '',
        relationship: 'Bố/Mẹ',
        phoneNumber: '',
        gender: 'Nam',
        age: 30
    })

    const { data: relatives = [], isLoading } = useQuery({
        queryKey: ['portal-family'],
        queryFn: () => getPortalFamily(headers),
        enabled: !!headers?.tenantId
    })

    const addMutation = useMutation({
        mutationFn: (data: any) => {
            if (data.id) {
                return updatePortalRelative(data.id, data, headers)
            }
            return addPortalRelative(data, headers)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-family'] })
            handleCloseModal()
            toast.success(editingId ? 'Đã cập nhật thông tin' : 'Đã thêm người thân mới')
        },
        onError: () => toast.error('Lỗi khi lưu thông tin')
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePortalRelative(id, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portal-family'] })
            toast.success('Đã xóa người thân')
        }
    })

    const handleEdit = (person: any) => {
        setEditingId(person.id)
        setNewRelative({
            fullName: person.fullName,
            relationship: person.relationship,
            phoneNumber: person.phoneNumber || '',
            gender: person.gender || 'Nam',
            age: person.age || 30
        })
        setIsAddModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsAddModalOpen(false)
        setEditingId(null)
        setNewRelative({
            fullName: '',
            relationship: 'Bố/Mẹ',
            phoneNumber: '',
            gender: 'Nam',
            age: 30
        })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getAvatarColor = useMemo(() => {
        return (idx: number) => AVATAR_COLORS[idx % AVATAR_COLORS.length];
    }, []);

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold">Đang tải danh sách...</div>

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
                            <Users className="w-8 h-8" />
                        </div>
                        Quản lý Người thân
                    </h1>
                    <p className="text-slate-500 font-medium text-lg ml-16">Chăm sóc sức khỏe cho cả gia đình bạn trong cùng một tài khoản.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                >
                    <UserPlus className="w-5 h-5" />
                    Thêm người thân
                </button>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatives.map((person, idx) => (
                    <motion.div
                        key={person.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-blue-500 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Heart className="w-20 h-20 text-blue-600" />
                        </div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black transition-all ${getAvatarColor(idx)}`}>
                                {person.avatarUrl ? (
                                    <img src={person.avatarUrl} alt="" className="w-full h-full object-cover rounded-[1.5rem]" />
                                ) : getInitials(person.fullName)}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(person)}
                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    title="Chỉnh sửa"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Xóa người thân này?')) deleteMutation.mutate(person.id)
                                    }}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="Xóa"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                    onClick={() => toast.success('Tính năng đang phát triển')}
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1 mb-8">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{person.fullName}</h3>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${person.gender === 'Nam' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {person.gender}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {person.relationship.includes('Con') ? <Baby className="w-3 h-3" /> : <UserCircle className="w-3 h-3" />}
                                {person.relationship} · {person.age} Tuổi
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => toast.success('Đang chuyển hướng đến Hồ sơ sức khỏe...')}
                                className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center gap-1"
                            >
                                <ChevronRight className="w-4 h-4" />
                                Hồ sơ
                            </button>
                            <button
                                onClick={() => navigate(`/patient/booking?for=${person.fullName}`)}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-1 shadow-lg shadow-blue-100"
                            >
                                <Calendar className="w-4 h-4" />
                                Đặt lịch
                            </button>
                        </div>
                    </motion.div>
                ))}

                {/* Empty State / Add Card */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-blue-300 transition-all min-h-[300px]"
                >
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 shadow-sm transition-all">
                        <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Thêm thành viên</p>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">Bố mẹ, vợ con hoặc người thân</p>
                    </div>
                </motion.button>
            </div>

            <section className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <ShieldCheck className="w-48 h-48" />
                </div>
                <div className="max-w-2xl relative z-10 space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tại sao nên thêm người thân?</h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <p className="text-sm font-black text-slate-900 tracking-tight">Đặt lịch nhanh chóng</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">Không cần nhập lại thông tin mỗi lần đặt lịch khám cho trẻ em hoặc người lớn tuổi.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-black text-slate-900 tracking-tight">Theo dõi tập trung</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">Quản lý toàn bộ hồ sơ bệnh án, đơn thuốc và lịch sử tiêm chủng của gia đình tại một nơi.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-black text-slate-900 tracking-tight">Nhận thông báo chung</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">Nhận lời nhắc tiêm phòng hoặc tái khám cho người thân ngay trên điện thoại của bạn.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-black text-slate-900 tracking-tight">Bảo mật thông tin</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">Thông tin y khoa được mã hóa và bảo vệ theo tiêu chuẩn quốc gia.</p>
                        </div>
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] p-8 md:p-10 w-full max-w-xl relative z-[101] shadow-2xl overflow-y-auto overflow-x-hidden premium-scrollbar max-h-[90vh]"
                        >
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6 text-slate-300" />
                            </button>

                            <div className="text-left space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                        {editingId ? 'Cập nhật thông tin' : 'Thêm người thân'}
                                    </h3>
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Thông tin cơ bản</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                                        <input
                                            value={newRelative.fullName}
                                            onChange={e => setNewRelative({ ...newRelative, fullName: e.target.value })}
                                            type="text"
                                            placeholder="Ví dụ: Nguyễn Minh Anh"
                                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quan hệ</label>
                                            <RelationshipSelector
                                                value={newRelative.relationship}
                                                onChange={val => setNewRelative({ ...newRelative, relationship: val })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giới tính</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Nam', 'Nữ'].map(g => (
                                                    <button
                                                        key={g}
                                                        onClick={() => setNewRelative({ ...newRelative, gender: g })}
                                                        className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${newRelative.gender === g ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tuổi</label>
                                            <input
                                                value={newRelative.age}
                                                onChange={e => setNewRelative({ ...newRelative, age: parseInt(e.target.value) || 0 })}
                                                type="number"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                                            <input
                                                value={newRelative.phoneNumber}
                                                onChange={e => setNewRelative({ ...newRelative, phoneNumber: e.target.value })}
                                                type="text"
                                                placeholder="09xx xxx xxx"
                                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => addMutation.mutate({ ...newRelative, id: editingId })}
                                    disabled={!newRelative.fullName || addMutation.isPending}
                                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-200 transition-all shadow-xl shadow-blue-100 mt-4"
                                >
                                    {addMutation.isPending ? 'Đang lưu...' : (editingId ? 'Cập nhật thông tin' : 'Lưu thông tin')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
