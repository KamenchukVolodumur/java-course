---
title: Execution Context
description: The idea of the "place" where code runs, single-threaded executors as an event queue, a custom event loop implementation, user interface threads in Swing and JavaFX, returning the result of background work to the UI thread, asynchronous continuations on a given executor.
---

## Where Code Runs

Often it matters not only **what** to run but also **where**: in which thread or pool. The abstraction of the "place of execution" in Java is the **`java.util.concurrent.Executor`** interface with a single method:

```java
public interface Executor {
    void execute(Runnable command);
}
```

The "place" may be a new thread, a thread pool, a single dedicated thread, a GUI thread or even another computer. The code that hands a task to an executor does not know the details: it just says "run this over there".

The most important case is **a single dedicated thread with a task queue** (an event loop). Tasks submitted from any threads run **sequentially, one at a time, in the same thread**. That is why they need no synchronization among themselves: state accessed only by these tasks is never used by two threads at once.

## Graphical Interfaces and the UI Thread

GUI libraries (Swing, JavaFX, Android) are **not thread-safe**: user interface elements may be changed only from one special thread — the **UI thread**. In Swing it is the *Event Dispatch Thread* (EDT), in JavaFX the *JavaFX Application Thread*. Event handlers (clicks, text input) run exactly in it.

Hence a typical task: run a long operation (downloading from the network, a computation) **in the background**, so that the interface does not "freeze", and show the result **by returning to the UI thread**. For returning, the libraries provide a "run on the UI thread" method:

```java
// Swing
button.addActionListener(e -> {                           // runs on the EDT
    button.setEnabled(false);
    CompletableFuture
            .supplyAsync(() -> download(url))             // a background thread
            .thenAcceptAsync(text -> {                    // back to the EDT
                textArea.setText(text);
                button.setEnabled(true);
            }, SwingUtilities::invokeLater);              // an Executor that runs code on the EDT
});

// JavaFX
CompletableFuture.supplyAsync(() -> download(url))
        .thenAcceptAsync(text -> label.setText(text), Platform::runLater);
```

`SwingUtilities::invokeLater` and `Platform::runLater` have the `void m(Runnable)` signature, so they are themselves implementations of `Executor`. That is why they can be passed to any API that accepts an executor.

> [!WARNING]
> Accessing UI components from a background thread does not always throw an exception (JavaFX throws `IllegalStateException: Not on FX application thread`, Swing does not). The error shows up as rare "glitches": components not repainted, exceptions inside the library, freezes.

## A Single-Threaded Executor

The simplest way to get an event loop is a ready-made single-threaded executor:

```java
ExecutorService eventLoop = Executors.newSingleThreadExecutor(
        Thread.ofPlatform().name("event-loop").daemon(true).factory());

List<String> sharedLog = new ArrayList<>();              // accessed only by the loop's tasks -> no synchronization

for (int i = 0; i < 3; i++) {
    int n = i;
    new Thread(() -> eventLoop.execute(() -> {
        sharedLog.add("message " + n);
        System.out.println(Thread.currentThread().getName() + ": " + sharedLog);
    })).start();
}
```

## A Custom Event Loop

To see what is inside, let us implement an executor with one thread and a task queue:

```java
public final class EventLoop implements Executor, AutoCloseable {
    private final BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();
    private final Thread thread;
    private volatile boolean running = true;
    private static final Runnable POISON = () -> { };       // a "poison pill" for stopping

    public EventLoop(String name) {
        thread = Thread.ofPlatform().name(name).start(this::processQueue);
    }

    @Override
    public void execute(Runnable command) {
        if (!running) throw new RejectedExecutionException("the event loop is stopped");
        queue.add(Objects.requireNonNull(command));
    }

    private void processQueue() {
        while (true) {
            Runnable task;
            try {
                task = queue.take();                        // waits for the next task
            } catch (InterruptedException e) {
                return;
            }
            if (task == POISON) return;
            try {
                task.run();
            } catch (RuntimeException e) {
                System.err.println("Exception in the event loop: " + e);   // one task does not stop the loop
            }
        }
    }

    public boolean inEventLoop() {
        return Thread.currentThread() == thread;
    }

    @Override
    public void close() throws InterruptedException {
        running = false;
        queue.add(POISON);                                  // finish the submitted tasks and stop
        thread.join();
    }
}
```

Now code from any thread can run a task on the event loop's thread:

```java
try (EventLoop loop = new EventLoop("event-loop")) {
    Thread worker = Thread.ofPlatform().name("worker").start(() -> {
        System.out.println(Thread.currentThread().getName() + " started");
        loop.execute(() -> System.out.println("Message from worker, run on: "
                + Thread.currentThread().getName()));
    });

    loop.execute(() -> System.out.println("Message from main, run on: "
            + Thread.currentThread().getName()));
    worker.join();
}
// worker started
// Message from main, run on: event-loop
// Message from worker, run on: event-loop
```

The order of the first two messages depends on the scheduler, but both run on the `event-loop` thread. This is exactly how the Swing EDT, the event loops of Netty and Vert.x, and "actors" in many frameworks are built.

## Continuations on a Given Executor

For asynchronous `CompletableFuture` chains (the previous page) you can always specify **where** to run the next step: the methods with the `Async` suffix accept an `Executor`:

```java
ExecutorService io = Executors.newVirtualThreadPerTaskExecutor();
EventLoop ui = new EventLoop("ui");

CompletableFuture
        .supplyAsync(() -> loadUser(id), io)                    // network — on virtual threads
        .thenApplyAsync(User::displayName, io)
        .thenAcceptAsync(name -> render(name), ui)              // rendering — on the "UI" thread
        .exceptionallyAsync(ex -> { showError(ex); return null; }, ui);
```

Without the `Async` suffix (e.g. `thenAccept`) the continuation runs on the thread that completed the previous stage, or on the thread that added the continuation if the stage was already complete. That is why, when it matters where exactly code runs, the executor is passed explicitly.
