package alum_net.chat_poc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // broker en memoria
        config.setApplicationDestinationPrefixes("/app"); // destinos que maneja el server
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Nativo (para React)
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*");

        // SockJS (para la pagina estatica de prueba)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
