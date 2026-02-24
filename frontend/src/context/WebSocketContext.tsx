import React, { createContext, useContext, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from '@/context/AuthContext'

interface WebSocketContextType {
    subscribe: (topic: string, callback: (msg: any) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth()
    const clientRef = useRef<Client | null>(null)
    const subscriptions = useRef<Map<string, Set<(msg: any) => void>>>(new Map())

    useEffect(() => {
        if (!user) return

        const apiBase = import.meta.env.VITE_API_BASE
        const wsUrl = apiBase
            ? (apiBase.endsWith('/') ? apiBase + 'ws-queue' : apiBase + '/ws-queue')
            : '/ws-queue'

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            onConnect: () => {
                console.log('Centralized WebSocket Connected')
                // Re-subscribe to all active topics
                subscriptions.current.forEach((callbacks, topic) => {
                    client.subscribe(topic, (message) => {
                        const body = JSON.parse(message.body)
                        callbacks.forEach(cb => cb(body))
                    })
                })
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        })

        client.activate()
        clientRef.current = client

        return () => {
            client.deactivate()
            clientRef.current = null
        }
    }, [user])

    const subscribe = (topic: string, callback: (msg: any) => void) => {
        if (!subscriptions.current.has(topic)) {
            subscriptions.current.set(topic, new Set())
            // If already connected, subscribe immediately
            if (clientRef.current?.connected) {
                clientRef.current.subscribe(topic, (message) => {
                    const body = JSON.parse(message.body)
                    subscriptions.current.get(topic)?.forEach(cb => cb(body))
                })
            }
        }

        subscriptions.current.get(topic)!.add(callback)

        return () => {
            const callbacks = subscriptions.current.get(topic)
            if (callbacks) {
                callbacks.delete(callback)
                if (callbacks.size === 0) {
                    subscriptions.current.delete(topic)
                    // Note: We don't necessarily need to unsubscribe from STOMP here 
                    // unless we want to be very strict, as the connection is shared.
                }
            }
        }
    }

    return (
        <WebSocketContext.Provider value={{ subscribe }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext)
    if (!context) throw new Error('useWebSocket must be used within WebSocketProvider')
    return context
}
