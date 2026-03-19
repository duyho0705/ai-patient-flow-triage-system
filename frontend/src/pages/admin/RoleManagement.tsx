import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/api/admin'
import { Shield, Plus, Edit2, Trash2, X, Check, Search, Info, Loader2, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RoleDto, PermissionDto } from '@/types/api'
import { CustomInput } from '../../components/CustomInput'
import { toastService } from '@/services/toast'
import { createPortal } from 'react-dom'

export function RoleManagement() {
    const queryClient = useQueryClient()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<RoleDto | null>(null)
    const [roleToDelete, setRoleToDelete] = useState<RoleDto | null>(null)
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
        mutationFn: (data: RoleDto) => {
            if (editingRole?.id) {
                return updateRole(editingRole.id, data)
            }
            return createRole(data)
        },
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
            setIsDeleteModalOpen(false)
            setRoleToDelete(null)
        },
        onError: (err: any) => {
            toastService.error(err.message || 'Lỗi khi xóa vai trò')
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
        <div className="w-full animate-in fade-in duration-700 font-sans space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end text-left">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Quản lý Vai trò</h2>
                    <p className="text-neutral-500">Phân quyền và kiểm soát truy cập hệ thống của các nhóm người dùng.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm vai trò..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm vai trò mới
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
                                    <div className="flex gap-3">
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal(role);
                                            }}
                                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm bg-white"
                                            title="Chỉnh sửa vai trò"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRoleToDelete(role);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm bg-white"
                                            title="Xóa vai trò"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
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
                {isModalOpen && createPortal(
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={closeModal}
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col z-10"
                        >
                            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                                <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 dark:bg-primary/20 text-white dark:text-primary rounded-2xl shadow-lg">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                                                {editingRole ? 'Cập nhật Vai trò' : 'Thêm vai trò hệ thống'}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">Phân quyền & Kiểm soát truy cập</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={closeModal} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm">
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

                                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-4 shrink-0">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-8 py-3.5 text-slate-500 font-black text-xs uppercase tracking-[0.2em] hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        Hủy thao tác
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        className="px-10 py-3.5 bg-slate-900 dark:bg-primary text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                                    >
                                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {mutation.isPending ? 'Đang lưu...' : (editingRole ? 'Cập nhật hệ thống' : 'Tạo vai trò mới')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>

            {/* Premium Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && roleToDelete && createPortal(
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => !deleteMutation.isPending && setIsDeleteModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full z-10 text-center space-y-6"
                        >
                            <div className="size-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto">
                                <Trash2 className="size-10 text-rose-500" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Xác nhận xóa?</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Bạn có chắc chắn muốn xóa vai trò <span className="text-rose-500 font-bold">{roleToDelete.nameVi}</span>? 
                                    Hành động này <span className="font-bold underline">không thể hoàn tác</span>.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={() => deleteMutation.mutate(roleToDelete.id)}
                                    disabled={deleteMutation.isPending}
                                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-200 dark:shadow-none"
                                >
                                    {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                    {deleteMutation.isPending ? 'Đang xóa...' : 'Đồng ý xóa vai trò'}
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={deleteMutation.isPending}
                                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                        </motion.div>
                    </div>,
                    document.body
                )}
            </AnimatePresence>
        </div>
    )
}
