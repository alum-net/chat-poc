package alum_net.chat_poc.repository;

import alum_net.chat_poc.model.ChatMessage;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByConversationIdOrderByIdDesc(String conversationId, Pageable page);

    List<ChatMessage> findByConversationIdAndIdLessThanOrderByIdDesc(String conversationId, ObjectId beforeId, Pageable page);

}
