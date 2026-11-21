// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "10-tcp": [
    {
      "question": "A client sent two messages over TCP with two write calls. How many read calls will the server need?",
      "options": [
        "Exactly two",
        "Unknown: TCP is a byte stream without message boundaries, so a framing protocol of your own is needed",
        "Exactly one",
        "TCP guarantees one message per packet"
      ],
      "answer": 1,
      "explanation": "TCP may merge or split data arbitrarily. The boundaries are set by the protocol: lines ending with \\n, a length prefix and so on."
    },
    {
      "question": "The client and server hang: each waits for a reply. The most likely cause?",
      "options": [
        "A wrong port",
        "The data stayed in the PrintWriter/BufferedWriter buffer without a flush()",
        "UDP instead of TCP",
        "Too many threads"
      ],
      "answer": 1,
      "explanation": "A buffered writer sends data only after flush() (or when the buffer fills up). Use autoFlush=true or an explicit flush()."
    }
  ],
  "10-serialization": [
    {
      "question": "Why must ObjectInputStream not be used for data from the network?",
      "options": [
        "It is slow",
        "Deserializing untrusted data lets an attacker execute code (gadget chains)",
        "It does not support strings",
        "It works only with files"
      ],
      "answer": 1,
      "explanation": "During deserialization, methods of classes from the classpath may run. A crafted chain of such calls gives remote code execution."
    },
    {
      "question": "Why use new TypeReference<List<Weather>>() { } in Jackson?",
      "options": [
        "For performance",
        "To work around type erasure: the anonymous subclass keeps the full generic type, so the library knows the element type",
        "For JSON validation",
        "It is outdated syntax"
      ],
      "answer": 1,
      "explanation": "List.class contains no information about Weather. The type parameter of an anonymous class's superclass is kept in the bytecode and is available to reflection."
    }
  ],
  "10-udp": [
    {
      "question": "Which of these is true about UDP?",
      "options": [
        "It guarantees delivery and order",
        "It preserves message (datagram) boundaries, but does not guarantee delivery or order",
        "It requires a handshake",
        "It does not support broadcasting"
      ],
      "answer": 1,
      "explanation": "UDP sends independent datagrams. That is why the application itself decides what to do about losses, e.g. with a timeout and a retransmission."
    }
  ],
  "10-processes-pipes": [
    {
      "question": "What happens if a child process writes a lot of data to stdout and the parent does not read it?",
      "options": [
        "The data is discarded",
        "The child process hangs when the pipe buffer fills up",
        "The data is automatically written to a file",
        "Nothing"
      ],
      "answer": 1,
      "explanation": "The OS pipe buffer is small (a few KB). It must be read, or the output redirected to a file."
    }
  ],
  "10-memory-mapped-files": [
    {
      "question": "What is the main advantage of MappedByteBuffer for IPC?",
      "options": [
        "It encrypts the data",
        "Two processes that mapped the same file see each other's changes without a system call per operation",
        "It works only within one process",
        "It does not need a file"
      ],
      "answer": 1,
      "explanation": "The file's pages are shared between the processes, so a write by one process is immediately visible to the other. Synchronization still has to be provided separately, though."
    }
  ]
}
