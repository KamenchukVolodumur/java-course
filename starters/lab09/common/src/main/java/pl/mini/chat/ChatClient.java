package pl.mini.chat;

import java.io.IOException;
import java.time.Duration;
import java.util.Optional;

// STAGE 4
public class ChatClient implements AutoCloseable {

    public ChatClient(String host, int port) throws IOException {
        throw new UnsupportedOperationException("TODO");
    }

    public void send(Message m) {
        throw new UnsupportedOperationException("TODO");
    }

    public Optional<Message> poll(Duration timeout) throws InterruptedException {
        throw new UnsupportedOperationException("TODO");
    }

    public Message receive() throws InterruptedException {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public void close() {
        throw new UnsupportedOperationException("TODO");
    }
}
