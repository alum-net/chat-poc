package alum_net.chat_poc.service;

import alum_net.chat_poc.model.ChatMessage;
import alum_net.chat_poc.repository.ChatMessageRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate broker;

    public ChatMessage persistAndBroadcast(String conversationId, ChatMessage in) {

        String sender = in.getSender() == null || in.getSender().isBlank() ? "anon" : in.getSender();
        String content = in.getContent();

        if (content != null && content.length() > 2000)
            content = content.substring(0, 2000);

        ChatMessage toSave = new ChatMessage(
                conversationId,
                in.getClientId(),
                sender,
                content,
                Instant.now()
        );

        ChatMessage saved = chatMessageRepository.save(toSave);

        broker.convertAndSend("/topic/conversations/" + conversationId, saved);
        return saved;
    }

    public ChatService(ChatMessageRepository repo, SimpMessagingTemplate broker) {
        this.chatMessageRepository = repo;
        this.broker = broker;
    }
}
