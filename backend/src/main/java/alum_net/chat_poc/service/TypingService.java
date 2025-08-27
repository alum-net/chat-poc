package alum_net.chat_poc.service;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TypingService {

    private final Map<String, Map<String, Long>> typing = new ConcurrentHashMap<>();
    private static final long TTL_MS = 5000;

    public List<String> markTyping(String convId, String user) {
        Map<String, Long> room = typing.computeIfAbsent(convId, k -> new ConcurrentHashMap<>());
        room.put(user, Instant.now().toEpochMilli() + TTL_MS);

        long now = Instant.now().toEpochMilli();
        room.entrySet().removeIf(e -> e.getValue() < now);
        return new ArrayList<>(room.keySet());
    }

    public List<String> unmarkTyping(String convId, String user) {
        Map<String, Long> room = typing.get(convId);
        if (room == null)
            return List.of();

        room.remove(user);
        prune(room);
        return new ArrayList<>(room.keySet());
    }

    private void prune(Map<String, Long> room) {
        long now = System.currentTimeMillis();
        room.entrySet().removeIf(e -> e.getValue() < now);
    }
}
