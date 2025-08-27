package alum_net.chat_poc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TypingEvent {
    private String user;
    private boolean typing;
}
