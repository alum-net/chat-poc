package alum_net.chat_poc.controller;

import alum_net.chat_poc.dto.MessagePage;
import alum_net.chat_poc.model.ChatMessage;
import alum_net.chat_poc.repository.ChatMessageRepository;
import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatRestController {

    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/{id}/messages")
    public MessagePage history(
            @PathVariable String id,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String beforeId) {

        int pageSize = Math.min(Math.max(limit, 1), 100);

        List<ChatMessage> descItems = (beforeId == null || beforeId.isBlank())
                ? chatMessageRepository.findByConversationIdOrderByIdDesc(id, PageRequest.of(0, pageSize))
                : chatMessageRepository.findByConversationIdAndIdLessThanOrderByIdDesc(id, new ObjectId(beforeId), PageRequest.of(0, pageSize));

        Collections.reverse(descItems);

        String nextCursor = descItems.isEmpty() ? null : descItems.get(0).getId();
        boolean hasMore = descItems.size() == pageSize;

        return new MessagePage(descItems, nextCursor, hasMore);
    }

    public ChatRestController(ChatMessageRepository repo) {
        this.chatMessageRepository = repo;
    }
}
