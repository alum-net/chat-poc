package alum_net.chat_poc.controller;

import alum_net.chat_poc.model.ChatMessage;
import alum_net.chat_poc.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/conversations/{id}/send")
    public void sendToConversation(@DestinationVariable String id, ChatMessage in) {
        chatService.persistAndBroadcast(id, in);
    }

    public ChatWebSocketController(ChatService chatService) {
        this.chatService = chatService;
    }
}
