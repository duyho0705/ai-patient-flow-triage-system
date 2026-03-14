import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/api/admin'
import { Shield, Plus, Edit2, Trash2, X, Check, Search, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RoleDto, PermissionDto } from '@/types/api'
import { CustomInput } from '../../components/CustomInput'
import { toastService } from '@/services/toast'

export function RoleManagement() {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<RoleDto | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [permSearch, setPermSearch] = useState('')
    const [formData, setFormData] = useState<{
        code: string
        nameVi: string
        description: string
        permissions: string[]
    }>({
        code: '',
        nameVi: '',
        description: '',
        permissions: []
    })

    const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: getRoles
    })

    const { data: permissions = [], isLoading: isLoadingPerms } = useQuery({
        queryKey: ['admin-permissions'],
        queryFn: getPermissions
    })

    const mutation = useMutation({
        mutationFn: (data: RoleDto) => editingRole ? updateRole(editingRole.id, data) : createRole(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
            toastService.success(editingRole ? 'Cập nhật vai trò thành công' : 'Tạo vai trò thành công')
            closeModal()
        },
        onError: (err: any) => {
            toastService.error(err.message || 'Có lỗi xảy ra')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
            toastService.success('Xóa vai trò thành công')
        }
    })

    const openModal = (role?: RoleDto) => {
        if (role) {
            setEditingRole(role)
            setFormData({
                code: role.code,
                nameVi: role.nameVi,
                description: role.description || '',
                permissions: role.permissions?.map(p => p.code) || []
            })
        } else {
            setEditingRole(null)
            setFormData({ code: '', nameVi: '', description: '', permissions: [] })
        }
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingRole(null)
    }

    const togglePermission = (code: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(code)
                ? prev.permissions.filter(c => c !== code)
                : [...prev.permissions, code]
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate({
            ...editingRole,
            code: formData.code,
            nameVi: formData.nameVi,
            description: formData.description,
            permissions: formData.permissions.map(code => ({ code } as PermissionDto))
        } as RoleDto)
    }

    const filteredRoles = roles.filter(r => 
        r.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Vai trò</h1>
                    <p className="text-slate-500 font-medium text-sm">Định nghĩa các nhóm quyền và gán cho nhân sự hệ thống.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm vai trò..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900 transition-all w-64"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm vai trò
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingRoles ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse" />
                    ))
                ) : filteredRoles.map((role: RoleDto) => (
                    <motion.div
                        key={role.id}
                        layout
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 flex flex-col justify-between hover:border-slate-300 transition-all group"
                    >
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="p-4 bg-slate-50 text-slate-900 rounded-3xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(role)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirm('Bạn có chắc chắn muốn xóa vai trò này?')) deleteMutation.mutate(role.id)
                                        }}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{role.nameVi}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{role.code}</p>
                            </div>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 min-h-[2.5rem]">
                                {role.description || 'Không có mô tả cho vai trò này.'}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {(role.permissions || []).slice(0, 5).map(p => (
                                    <span key={p.code} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded-full border border-slate-100 uppercase">
                                        {p.code}
                                    </span>
                                ))}
                                {(role.permissions || []).length > 5 && (
                                    <span className="text-[9px] font-bold text-slate-400 ml-1">
                                        +{role.permissions!.length - 5}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                                {editingRole ? 'Chỉnh sửa Vai trò' : 'Thêm vai trò mới'}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thiết lập quyền hạn truy cập</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={closeModal} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 flex flex-col lg:flex-row gap-12">
                                    <div className="w-full lg:w-1/3 space-y-8">
                                        <div className="space-y-6">
                                            <CustomInput
                                                label="Mã vai trò (CODE)"
                                                value={formData.code}
                                                onChange={(val: string) => setFormData(f => ({ ...f, code: val.toUpperCase() }))}
                                                placeholder="VD: SYSTEM_ADMIN"
                                                disabled={!!editingRole}
                                                required
                                            />
                                            <CustomInput
                                                label="Tên hiển thị"
                                                value={formData.nameVi}
                                                onChange={(val: string) => setFormData(f => ({ ...f, nameVi: val }))}
                                                placeholder="VD: Quản trị hệ thống"
                                                required
                                            />
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Mô tả</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-slate-900 transition-all outline-none min-h-[120px]"
                                                    placeholder="Mô tả chức năng của vai trò này..."
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl">
                                            <div className="flex gap-3">
                                                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                                                <p className="text-xs font-medium text-blue-700 leading-relaxed">
                                                    Mã vai trò phải là duy nhất và không thể thay đổi sau khi tạo. Đảm bảo tên hiển thị mô tả đúng trách nhiệm.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-2/3 flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Phân quyền (Permissions)</label>
                                            <span className="text-xs font-bold text-slate-400">{formData.permissions.length} đã chọn</span>
                                        </div>
                                        
                                        <div className="flex-1 border border-slate-100 rounded-[2.5rem] bg-slate-50/30 overflow-hidden flex flex-col">
                                            <div className="p-4 border-b border-slate-100 bg-white">
                                                <div className="relative">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Tìm kiếm quyền..."
                                                        value={permSearch}
                                                        onChange={(e) => setPermSearch(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {isLoadingPerms ? (
                                                    Array(10).fill(0).map((_, i) => <div key={i} className="h-10 bg-white rounded-xl animate-pulse" />)
                                                ) : permissions.filter(p => 
                                                    p.code.toLowerCase().includes(permSearch.toLowerCase()) || 
                                                    p.name.toLowerCase().includes(permSearch.toLowerCase())
                                                ).map((perm: PermissionDto) => (
                                                    <button
                                                        key={perm.code}
                                                        type="button"
                                                        onClick={() => togglePermission(perm.code)}
                                                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                                                            formData.permissions.includes(perm.code)
                                                                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                                                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                                            formData.permissions.includes(perm.code)
                                                                ? 'bg-white/20 border-white/20'
                                                                : 'bg-slate-50 border-slate-200'
                                                        }`}>
                                                            {formData.permissions.includes(perm.code) && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{perm.code}</span>
                                                            <span className="text-[9px] font-bold opacity-60 line-clamp-1">{perm.name}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 shrink-0">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-8 py-3.5 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {mutation.isPending ? 'Đang lưu...' : (editingRole ? 'Cập nhật' : 'Tạo mới')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
