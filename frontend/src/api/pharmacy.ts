import { get, post } from './client'
import type { TenantHeaders } from './client'
import type { PharmacyProductDto, PharmacyInventoryDto, InventoryTransactionDto } from '@/types/api'

export async function getPharmacyProducts(tenant: TenantHeaders | null): Promise<PharmacyProductDto[]> {
    return get<PharmacyProductDto[]>('/pharmacy/products', tenant)
}

export async function createPharmacyProduct(body: Partial<PharmacyProductDto>, tenant: TenantHeaders | null): Promise<PharmacyProductDto> {
    return post<PharmacyProductDto>('/pharmacy/products', body, tenant)
}

export async function getPharmacyInventory(branchId: string, tenant: TenantHeaders | null): Promise<PharmacyInventoryDto[]> {
    return get<PharmacyInventoryDto[]>(`/pharmacy/inventory?branchId=${branchId}`, tenant)
}

export async function restockInventory(params: { branchId: string; productId: string; quantity: number; notes?: string }, tenant: TenantHeaders | null): Promise<void> {
    const sp = new URLSearchParams()
    sp.set('branchId', params.branchId)
    sp.set('productId', params.productId)
    sp.set('quantity', params.quantity.toString())
    if (params.notes) sp.set('notes', params.notes)
    return post<void>(`/pharmacy/inventory/restock?${sp.toString()}`, {}, tenant)
}

export async function getInventoryTransactions(branchId: string, tenant: TenantHeaders | null): Promise<InventoryTransactionDto[]> {
    return get<InventoryTransactionDto[]>(`/pharmacy/inventory/transactions?branchId=${branchId}`, tenant)
}
