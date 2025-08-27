package alum_net.chat_poc.controller;

import alum_net.chat_poc.dto.TypingEvent;
import alum_net.chat_poc.service.TypingService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class TypingWebSocketController {
    private final TypingService typingService;
    private final SimpMessagingTemplate broker;

    @MessageMapping("/conversations/{id}/typing")
    public void typing(@DestinationVariable String id, TypingEvent typingEvent) {
        if (typingEvent.getUser() == null || typingEvent.getUser().isBlank())
            return;

        List<String> users = typingEvent.isTyping()
                ? typingService.markTyping(id, typingEvent.getUser())
                : typingService.unmarkTyping(id, typingEvent.getUser());

        broker.convertAndSend("/topic/conversations/" + id + "/typing", users);}

    public TypingWebSocketController(TypingService s, SimpMessagingTemplate b) {
        this.typingService = s; this.broker = b;
    }
}
