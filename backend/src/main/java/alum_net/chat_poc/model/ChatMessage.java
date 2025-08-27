package alum_net.chat_poc.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "chat_messages")
@CompoundIndex(name = "conversation_id_idx", def = "{'conversationId':1,'_id':-1}")
public class ChatMessage {

    @Id
    private String id;
    private String conversationId;
    private String clientId;
    private String sender; //Nickname (en POC sin auth, hay que ver como hacer cuando tengamos security
    private String content;
    private Instant ts;

    public ChatMessage(String conversationId, String clientId, String sender, String content, Instant ts) {
        this.conversationId = conversationId;
        this.clientId = clientId;
        this.sender = sender;
        this.content = content;
        this.ts = ts;
    }
}
