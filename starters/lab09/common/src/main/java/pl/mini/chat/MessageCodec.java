package pl.mini.chat;

// STAGE 1
public final class MessageCodec {
    private MessageCodec() { }

    /** One line of JSON, without a trailing line break. */
    public static String encode(Message m) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Message decode(String line) throws ProtocolException {
        throw new UnsupportedOperationException("TODO");
    }
}
