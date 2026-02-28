package vn.clinic.cdm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Topic for broadcasting to many clients (e.g., queue updates)
        config.enableSimpleBroker("/topic");

        // Prefix for messages from client to server (if needed)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint for clients to connect
        registry.addEndpoint("/ws-queue")
                .setAllowedOriginPatterns("*") // In production, limit this to your frontend URL
                .withSockJS();

        // Fallback for clients that don't support SockJS
        registry.addEndpoint("/ws-queue")
                .setAllowedOriginPatterns("*");
    }
}

