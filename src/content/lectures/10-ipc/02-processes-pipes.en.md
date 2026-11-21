---
title: Processes and Pipes
description: Starting child processes with ProcessBuilder, standard streams as anonymous pipes, redirection, end of file and deadlocks, a program acting as both parent and child, process pipelines, ProcessHandle, named pipes — FIFOs and Unix domain sockets.
---

## Pipes

A **pipe** is an IPC mechanism that transfers data between processes in one or both directions. It behaves like a byte stream: one process writes to one end of the pipe, another reads from the other end.

> [!NOTE]
> Reading from a pipe is **blocking**: if the pipe is empty, the reader waits until data appears at the other end or the pipe is closed. If the pipe is full (the OS buffer has a limited size, often 4–64 KB), it is the write that blocks.

There are:

* **anonymous** pipes — without a name in the system; a child process inherits them from its parent. This is how the standard `stdin`/`stdout` streams of the processes in a shell pipeline `ls | grep java` are connected;
* **named** pipes — they have a name, so any two processes can connect to them.

## Child Processes

`ProcessBuilder` describes the command to run, and `start()` creates the process and returns a `Process` object:

```java
Process process = new ProcessBuilder("git", "--version")
        .directory(new File("."))                      // the working directory
        .redirectErrorStream(true)                     // stderr -> the same pipe as stdout
        .start();

String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
int exitCode = process.waitFor();                      // wait for it to finish
System.out.println(exitCode + ": " + output.strip());  // 0: git version 2.47.0
```

> [!WARNING]
> The command and its arguments are passed as **separate strings**, not as one string with spaces: `new ProcessBuilder("git", "commit", "-m", message)`. No shell is used, so `|`, `>`, `*` and environment variables in the arguments have no special meaning. This is also a protection against command injection when the arguments come from a user.

### Standard Streams as Pipes

By default the JVM creates **three anonymous pipes** for a child process. The method names are given from the parent's point of view:

| `Process` method | Child's stream | Parent |
| --- | --- | --- |
| `getOutputStream()` | stdin | writes |
| `getInputStream()` | stdout | reads |
| `getErrorStream()` | stderr | reads |

Java 17 added the convenient wrappers `outputWriter()`, `inputReader()` and `errorReader()` with an encoding.

Instead of a pipe, a stream can be **redirected**:

```java
new ProcessBuilder("javac", "Main.java")
        .redirectOutput(ProcessBuilder.Redirect.INHERIT)                 // to the parent's console
        .redirectError(ProcessBuilder.Redirect.appendTo(new File("errors.log")))
        .redirectInput(ProcessBuilder.Redirect.from(new File("input.txt")))
        .start()
        .waitFor();

new ProcessBuilder("java", "-jar", "app.jar").inheritIO().start();      // inherit all three
```

### End of Data and Deadlocks

Two typical mistakes when working with pipes:

1. **The child waits for the end of input.** A program that reads stdin to the end (e.g. `sort`) does not finish until the parent **closes** its end of the pipe: only closing means "there will be no more data" (EOF).
2. **Buffer overflow.** If the parent waits with `waitFor()` without reading the child's stdout, and the child writes more than the pipe buffer holds, the child blocks on writing, the parent on waiting, and both wait forever. The output is read **before** `waitFor()`, and stdout and stderr in parallel (or merged with `redirectErrorStream(true)`).

```java
Process sort = new ProcessBuilder("sort").start();

try (BufferedWriter toChild = sort.outputWriter()) {        // closing = EOF for the child
    for (String word : List.of("pear", "apple", "apricot")) {
        toChild.write(word);
        toChild.newLine();
    }
}

try (BufferedReader fromChild = sort.inputReader()) {
    fromChild.lines().forEach(System.out::println);          // apple, apricot, pear
}
System.out.println("Exit code: " + sort.waitFor());
```

## Parent and Child in One Program

The same program can play both roles depending on its arguments. The parent starts a copy of itself with the `child` argument and writes lines to its stdin, and the child converts them to uppercase and prints them:

```java
public class PipeDemo {
    public static void main(String[] args) throws Exception {
        if (args.length == 1 && args[0].equals("child")) {
            childWork();
        } else {
            parentWork();
        }
    }

    static void parentWork() throws Exception {
        String java = ProcessHandle.current().info().command().orElse("java");   // the same java
        Process child = new ProcessBuilder(java, "-cp", System.getProperty("java.class.path"),
                PipeDemo.class.getName(), "child")
                .redirectOutput(ProcessBuilder.Redirect.INHERIT)                  // the child's stdout -> the console
                .start();
        System.out.println("The child process started, PID: " + child.pid());

        try (BufferedWriter writer = child.outputWriter()) {
            for (String line : Files.readAllLines(Path.of("lorem.txt"))) {
                Thread.sleep(500);
                writer.write(line);
                writer.newLine();
                writer.flush();                                 // otherwise the line gets stuck in the buffer
            }
        }                                                       // try removing the closing

        child.waitFor();
    }

    static void childWork() throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        String line;
        while ((line = reader.readLine()) != null) {            // null = the parent closed the pipe
            System.out.println(line.toUpperCase());
        }
    }
}
```

The key point is closing the `writer` in the parent. It sends the end of file to the child: `readLine()` returns `null`, the loop ends, and the child exits. Without closing, the child would wait for data forever, and the parent for the child to finish: a **deadlock**.

### Process Pipelines

`ProcessBuilder.startPipeline` (Java 9) connects the stdout of each process to the stdin of the next one, like `|` in a shell:

```java
List<Process> pipeline = ProcessBuilder.startPipeline(List.of(
        new ProcessBuilder("cat", "access.log"),
        new ProcessBuilder("grep", "ERROR"),
        new ProcessBuilder("wc", "-l")));

Process last = pipeline.getLast();
System.out.println(new String(last.getInputStream().readAllBytes()).strip());
```

### ProcessHandle

`ProcessHandle` gives information about OS processes, including those not started by our program:

```java
ProcessHandle self = ProcessHandle.current();
System.out.println(self.pid());
self.info().commandLine().ifPresent(System.out::println);

ProcessHandle.allProcesses()
        .filter(p -> p.info().command().map(c -> c.endsWith("java")).orElse(false))
        .forEach(p -> System.out.println(p.pid() + " " + p.info().startInstant().orElse(null)));

child.toHandle().onExit().thenAccept(p -> System.out.println("Process " + p.pid() + " has exited"));
child.destroy();                                      // a "polite" termination (SIGTERM)
child.destroyForcibly();                              // a forced one (SIGKILL)
```

## Named Pipes

The Java standard library has no separate API for named pipes. The following are used:

* **FIFO files** on Unix: the pipe is created with the `mkfifo` command and then used like an ordinary file (`Files.newBufferedReader`, `Files.newBufferedWriter`). Opening for reading blocks until someone opens the pipe for writing, and vice versa. A FIFO is unidirectional: a reply needs a second pipe.
* **Unix domain sockets** (Java 16, also working on Windows 10+) — a bidirectional connection between processes on one machine through a socket file in the file system. The API is the same as for NIO TCP channels (`SocketChannel`, `ServerSocketChannel`), only the address differs: `UnixDomainSocketAddress`. This is the closest counterpart of a named pipe.

The server creates the socket and waits for a client, then returns the received lines in uppercase:

```java
public class Server {
    public static void main(String[] args) throws IOException {
        Path socketFile = Path.of(System.getProperty("java.io.tmpdir"), "p3_pipe.socket");
        Files.deleteIfExists(socketFile);                    // a leftover from a previous run
        var address = UnixDomainSocketAddress.of(socketFile);

        try (ServerSocketChannel server = ServerSocketChannel.open(StandardProtocolFamily.UNIX)) {
            server.bind(address);
            try (SocketChannel channel = server.accept();     // waits for a client
                 BufferedReader reader = new BufferedReader(Channels.newReader(channel, StandardCharsets.UTF_8));
                 PrintWriter writer = new PrintWriter(Channels.newWriter(channel, StandardCharsets.UTF_8), true)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    writer.println(line.toUpperCase());
                }
            }
        } finally {
            Files.deleteIfExists(socketFile);
        }
    }
}
```

The client connects to the same address, sends the lines of a file and prints the replies:

```java
public class Client {
    public static void main(String[] args) throws Exception {
        Path socketFile = Path.of(System.getProperty("java.io.tmpdir"), "p3_pipe.socket");

        try (SocketChannel channel = SocketChannel.open(UnixDomainSocketAddress.of(socketFile));
             BufferedReader reader = new BufferedReader(Channels.newReader(channel, StandardCharsets.UTF_8));
             PrintWriter writer = new PrintWriter(Channels.newWriter(channel, StandardCharsets.UTF_8), true)) {
            for (String line : Files.readAllLines(Path.of("lorem.txt"))) {
                Thread.sleep(500);
                writer.println(line);                         // autoFlush = true: println sends immediately
                System.out.println(reader.readLine());
            }
        }
    }
}
```

> [!NOTE]
> Within one process, `PipedInputStream`/`PipedOutputStream` connect **threads**. But that is not IPC, and blocking queues are more convenient for exchanging data between threads.
