package alum_net.chat_poc.dto;

import alum_net.chat_poc.model.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MessagePage {
    private List<ChatMessage> items;
    private String nextCursor;
    private boolean hasMore;
}
