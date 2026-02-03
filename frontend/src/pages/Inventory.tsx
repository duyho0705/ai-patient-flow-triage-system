import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTenant } from '@/context/TenantContext'
import { getPharmacyInventory, restockInventory, createPharmacyProduct, getInventoryTransactions } from '@/api/pharmacy'
import { toastService } from '@/services/toast'
import {
    Package, Search, ArrowUpRight, AlertTriangle, Plus, X, Boxes,
    Tag, ShieldCheck, DollarSign, History, BarChart3, ArrowDownLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Inventory() {
    const { headers, branchId } = useTenant()
    const queryClient = useQueryClient()
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'STOCK' | 'HISTORY'>('STOCK')
    const [selectedProductForRestock, setSelectedProductForRestock] = useState<string | null>(null)
    const [restockQty, setRestockQty] = useState(0)
    const [isProductModalOpen, setIsProductModalOpen] = useState(false)
    const [newProduct, setNewProduct] = useState({
        code: '',
        nameVi: '',
        genericName: '',
        unit: 'Viên',
        standardPrice: 0
    })

    const { data: inventory, isLoading: isInvLoading } = useQuery({
        queryKey: ['pharmacy-inventory', branchId],
        queryFn: () => getPharmacyInventory(branchId!, headers),
        enabled: !!branchId && !!headers?.tenantId,
    })

    const { data: transactions, isLoading: isTransLoading } = useQuery({
        queryKey: ['inventory-transactions', branchId],
        queryFn: () => getInventoryTransactions(branchId!, headers),
        enabled: activeTab === 'HISTORY' && !!branchId && !!headers?.tenantId,
    })

    const addStock = useMutation({
        mutationFn: (data: { productId: string; quantity: number }) =>
            restockInventory({ branchId: branchId!, ...data }, headers),
        onSuccess: () => {
            toastService.success('📦 Đã cập nhật tồn kho thành công')
            setSelectedProductForRestock(null)
            setRestockQty(0)
            queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] })
            queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] })
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    const createProductMutation = useMutation({
        mutationFn: (data: typeof newProduct) => createPharmacyProduct(data, headers),
        onSuccess: () => {
            toastService.success('✨ Thêm thuốc mới thành công')
            setIsProductModalOpen(false)
            setNewProduct({ code: '', nameVi: '', genericName: '', unit: 'Viên', standardPrice: 0 })
            queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] })
        },
        onError: (e: Error) => toastService.error(e.message),
    })

    const filteredInventory = inventory?.filter(i =>
        i.product.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.product.genericName && i.product.genericName.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const lowStockCount = inventory?.filter(i => i.currentStock <= i.minStockLevel).length || 0

    return (
        <div className="mx-auto max-w-7xl space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header with Stats Section */}
            <div className="space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kho dược phẩm</h1>
                        <p className="text-slate-500 mt-2 font-medium">Hệ thống kiểm soát thuốc, vật tư y tế và định mức tồn kho.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-1 self-end">
                            {[
                                { id: 'STOCK', label: 'Tồn kho hiện tại', icon: Boxes },
                                { id: 'HISTORY', label: 'Lịch sử biến động', icon: History }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsProductModalOpen(true)}
                            className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm tracking-tight hover:bg-[#2b8cee] hover:shadow-2xl hover:shadow-[#2b8cee]/20 transition-all active:scale-95"
                        >
                            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                            Đăng ký Thuốc
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Boxes className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng mặt hàng</p>
                            <h4 className="text-2xl font-black text-slate-900">{inventory?.length || 0}</h4>
                        </div>
                    </div>
                    <div className={`p-6 rounded-[2rem] border flex items-center gap-5 transition-colors ${lowStockCount > 0 ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sắp hết hàng</p>
                            <h4 className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{lowStockCount}</h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                            <BarChart3 className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng thuốc đã kê</p>
                            <h4 className="text-2xl font-black text-slate-900">{transactions?.filter(t => t.type === 'DISPENSE').length || 0}</h4>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="flex-1">
                            <div className="relative group">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm nhanh..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-slate-300 pl-6"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'STOCK' ? (
                    <motion.section
                        key="stock"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin dược phẩm</th>
                                        <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn vị</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá niêm yết</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Tình trạng kho</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(isInvLoading) ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/10" />
                                            </tr>
                                        ))
                                    ) : filteredInventory?.map((item) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/40 transition-all duration-300">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-slate-200">
                                                        {item.product.code.slice(0, 3)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 tracking-tight leading-none mb-1">{item.product.nameVi}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">#{item.product.code} · {item.product.genericName || 'Biệt dược'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                                                    {item.product.unit}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="font-black text-slate-900">{(item.product.standardPrice || 0).toLocaleString('vi-VN')} đ</div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`text-xl font-black ${item.currentStock <= item.minStockLevel ? 'text-red-500' : 'text-slate-900'}`}>
                                                        {item.currentStock}
                                                    </div>
                                                    {item.currentStock <= item.minStockLevel && (
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-red-400 uppercase tracking-widest">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Dưới mức an toàn
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => setSelectedProductForRestock(item.product.id)}
                                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 p-3 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm group-hover:shadow-md active:scale-95"
                                                >
                                                    <ArrowUpRight className="h-4 w-4" />
                                                    <span className="text-xs font-black uppercase tracking-widest pr-1">Nhập hàng</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.section>
                ) : (
                    <motion.section
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {isTransLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-[2rem] animate-pulse" />)
                        ) : transactions?.length === 0 ? (
                            <div className="bg-white rounded-[3rem] py-24 text-center border border-slate-100">
                                <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Chưa có lịch sử biến động</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {transactions?.map(t => (
                                    <div key={t.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between group hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${t.type === 'PURCHASE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {t.type === 'PURCHASE' ? <ArrowDownLeft className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.type === 'PURCHASE' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {t.type === 'PURCHASE' ? 'Nhập kho' : 'Cấp phát'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-300">
                                                        {new Date(t.createdAt).toLocaleString('vi-VN')}
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-slate-900 leading-tight">
                                                    {t.product.nameVi}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">{t.notes || 'Không có ghi chú'}</p>
                                                    {t.performedByUserName && (
                                                        <span className="text-[10px] text-slate-300 font-medium">· Thực hiện bởi: {t.performedByUserName}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-black ${t.quantity > 0 ? 'text-emerald-500' : 'text-blue-600'}`}>
                                                {t.quantity > 0 ? '+' : ''}{t.quantity}
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.product.unit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Restock Modal */}
            <AnimatePresence>
                {selectedProductForRestock && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setSelectedProductForRestock(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-16 -mt-16">
                                <Package className="w-64 h-64" />
                            </div>

                            <div className="relative mb-8 text-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
                                    <Tag className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cập nhật Số lượng</h3>
                                <p className="text-slate-500 font-medium text-sm mt-2">Xác nhận nhập thêm thuốc vào kho chi nhánh.</p>
                            </div>

                            <div className="space-y-6 relative">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Số lượng nhập kho</label>
                                    <input
                                        type="number"
                                        autoFocus
                                        placeholder="Nhập con số..."
                                        value={restockQty || ''}
                                        onChange={(e) => setRestockQty(Number(e.target.value))}
                                        className="w-full text-4xl font-black px-0 border-none focus:ring-0 text-center text-slate-900 placeholder:text-slate-100"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={() => addStock.mutate({ productId: selectedProductForRestock, quantity: restockQty })}
                                        disabled={addStock.isPending || restockQty <= 0}
                                        className="bg-slate-900 text-white py-5 rounded-[1.5rem] font-black tracking-tight hover:bg-[#2b8cee] shadow-xl hover:shadow-[#2b8cee]/20 transition-all disabled:opacity-50"
                                    >
                                        {addStock.isPending ? 'Đang gửi lệnh...' : 'Xác nhận Nhập kho'}
                                    </button>
                                    <button onClick={() => setSelectedProductForRestock(null)} className="text-slate-400 font-black text-xs uppercase tracking-widest py-2 hover:text-slate-600 transition-colors">
                                        Hủy thao tác
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setIsProductModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Khai báo Thuốc mới</h2>
                                </div>
                                <button onClick={() => setIsProductModalOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mã định danh (SKU)</label>
                                        <input
                                            type="text"
                                            placeholder="Gõ mã hệ thống..."
                                            value={newProduct.code}
                                            onChange={e => setNewProduct({ ...newProduct, code: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Đơn vị tính</label>
                                        <select
                                            value={newProduct.unit}
                                            onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        >
                                            {['Viên', 'Vỉ', 'Chai', 'Ống', 'Hộp', 'Túi', 'Gói'].map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tên thương mại / Nhà sản xuất</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Paracetamol Panadol Extra..."
                                            value={newProduct.nameVi}
                                            onChange={e => setNewProduct({ ...newProduct, nameVi: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Thành phần hoạt chất (Generic)</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Acetaminophen 500mg..."
                                            value={newProduct.genericName}
                                            onChange={e => setNewProduct({ ...newProduct, genericName: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all italic placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            Giá bán lẻ tiêu chuẩn
                                        </label>
                                        <input
                                            type="number"
                                            value={newProduct.standardPrice}
                                            onChange={e => setNewProduct({ ...newProduct, standardPrice: Number(e.target.value) })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-2xl text-[#2b8cee] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-50 pt-8">
                                    <button
                                        onClick={() => createProductMutation.mutate(newProduct)}
                                        disabled={createProductMutation.isPending || !newProduct.code || !newProduct.nameVi}
                                        className="flex-1 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black tracking-tight hover:bg-[#2b8cee] shadow-xl hover:shadow-[#2b8cee]/20 transition-all disabled:opacity-50"
                                    >
                                        {createProductMutation.isPending ? 'Đang khởi tạo...' : 'Lưu vào danh mục'}
                                    </button>
                                    <button onClick={() => setIsProductModalOpen(false)} className="px-10 py-5 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
