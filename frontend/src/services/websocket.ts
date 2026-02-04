import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export class WebSocketService {
    private client: Client | null = null

    constructor(
        private onMessage: (msg: any) => void,
        private topic: string = '/topic/queue'
    ) { }

    connect() {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
        const wsUrl = apiBase.endsWith('/') ? apiBase + 'ws-queue' : apiBase + '/ws-queue'

        this.client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            onConnect: () => {
                console.log(`Connected to WebSocket, subscribing to ${this.topic}`)
                this.client?.subscribe(this.topic, (message) => {
                    try {
                        const body = JSON.parse(message.body)
                        this.onMessage(body)
                    } catch (e) {
                        this.onMessage(message.body)
                    }
                })
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message'])
            },
        })

        this.client.activate()
    }

    disconnect() {
        this.client?.deactivate()
    }
}
