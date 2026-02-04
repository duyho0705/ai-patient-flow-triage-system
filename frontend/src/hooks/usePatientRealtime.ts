import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toastService } from '@/services/toast'
import { useTenant } from '@/context/TenantContext'
import { useWebSocket } from '@/context/WebSocketContext'

export function usePatientRealtime(patientId: string | undefined, branchId: string | undefined) {
    const queryClient = useQueryClient()
    const { headers } = useTenant()
    const { subscribe } = useWebSocket()

    useEffect(() => {
        if (!patientId || !headers) return

        // 1. Subscribe to Personal Channel
        const unsubscribePersonal = subscribe(`/topic/patient/${patientId}`, (msg) => {
            console.log('Realtime Personal Event:', msg)
            switch (msg.type) {
                case 'NOTIFICATION':
                case 'QUEUE':
                case 'BILLING':
                case 'PHARMACY':
                    toastService.info(msg.body || 'Thông báo mới')
                    queryClient.invalidateQueries({ queryKey: ['patient-notifications'] })
                    queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] })
                    break
                case 'APPOINTMENT_REFRESH':
                    queryClient.invalidateQueries({ queryKey: ['portal-appointments'] })
                    queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] })
                    break
                case 'QUEUE_REFRESH':
                    queryClient.invalidateQueries({ queryKey: ['portal-queues'] })
                    break
            }
        })

        // 2. Subscribe to Branch Channel (Optional)
        let unsubscribeBranch = () => { }
        if (branchId) {
            unsubscribeBranch = subscribe(`/topic/queue/${branchId}`, (msg) => {
                if (msg.type === 'QUEUE_REFRESH') {
                    console.log('Branch Queue Refresh Signal Received')
                    queryClient.invalidateQueries({ queryKey: ['portal-queues'] })
                }
            })
        }

        return () => {
            unsubscribePersonal()
            unsubscribeBranch()
        }
    }, [patientId, branchId, queryClient, headers, subscribe])
}
