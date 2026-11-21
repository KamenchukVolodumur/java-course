package pl.mini.chat;

// STAGE 1: add the Jackson annotations (@JsonTypeInfo, @JsonSubTypes) here, or write your own codec
public sealed interface Message {
    record Join(String user) implements Message { }
    record Say(String user, String text) implements Message { }
    record Leave(String user) implements Message { }
    record Info(String text) implements Message { }       // server -> client
    record Error(String reason) implements Message { }    // server -> client
}
