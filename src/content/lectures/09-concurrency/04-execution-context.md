---
title: Контекст виконання
description: Ідея «місця», де виконується код, однопотокові виконавці як черга подій, власна реалізація циклу подій, потоки інтерфейсу користувача в Swing і JavaFX, повернення результату фонової роботи в потік UI, асинхронні продовження на заданому виконавці.
---

## Де виконується код

Часто важливо не лише **що** виконати, а й **де**: у якому потоці чи пулі. Абстракція «місця виконання» в Java — інтерфейс **`java.util.concurrent.Executor`** з одним методом:

```java
public interface Executor {
    void execute(Runnable command);
}
```

«Місцем» може бути новий потік, пул потоків, один виділений потік, потік графічного інтерфейсу чи навіть інший комп'ютер. Код, що передає задачу виконавцю, не знає подробиць: він лише каже «виконай це там».

Найважливіший випадок — **один виділений потік з чергою задач** (цикл подій, event loop). Задачі, подані з будь-яких потоків, виконуються **послідовно, по одній, у тому самому потоці**. Тому їм не потрібна синхронізація між собою: стан, до якого звертаються лише ці задачі, ніколи не використовується двома потоками одночасно.

## Графічні інтерфейси і потік UI

Бібліотеки графічного інтерфейсу (Swing, JavaFX, Android) **не потокобезпечні**: змінювати елементи інтерфейсу можна лише з одного спеціального потоку — **потоку інтерфейсу** (UI thread). У Swing це *Event Dispatch Thread* (EDT), у JavaFX — *JavaFX Application Thread*. Обробники подій (кліки, введення тексту) виконуються саме в ньому.

Звідси типова задача: довгу операцію (завантаження з мережі, обчислення) виконати **у фоні**, щоб інтерфейс не «зависав», а результат показати, **повернувшись у потік UI**. Для повернення бібліотеки надають метод «виконай у потоці UI»:

```java
// Swing
button.addActionListener(e -> {                           // виконується в EDT
    button.setEnabled(false);
    CompletableFuture
            .supplyAsync(() -> download(url))             // фоновий потік
            .thenAcceptAsync(text -> {                    // назад у EDT
                textArea.setText(text);
                button.setEnabled(true);
            }, SwingUtilities::invokeLater);              // Executor, що виконує код у EDT
});

// JavaFX
CompletableFuture.supplyAsync(() -> download(url))
        .thenAcceptAsync(text -> label.setText(text), Platform::runLater);
```

`SwingUtilities::invokeLater` і `Platform::runLater` мають сигнатуру `void m(Runnable)`, тобто самі є реалізаціями `Executor`. Тому їх можна передати будь-якому API, що приймає виконавця.

> [!WARNING]
> Звертання до компонентів інтерфейсу з фонового потоку не завжди кидає виняток (JavaFX кидає `IllegalStateException: Not on FX application thread`, Swing — ні). Помилка проявляється рідкісними «глюками»: неперемальованими компонентами, винятками всередині бібліотеки, зависаннями.

## Однопотоковий виконавець

Найпростіше отримати цикл подій готовим однопотоковим виконавцем:

```java
ExecutorService eventLoop = Executors.newSingleThreadExecutor(
        Thread.ofPlatform().name("event-loop").daemon(true).factory());

List<String> sharedLog = new ArrayList<>();              // звертаються лише задачі циклу -> без синхронізації

for (int i = 0; i < 3; i++) {
    int n = i;
    new Thread(() -> eventLoop.execute(() -> {
        sharedLog.add("повідомлення " + n);
        System.out.println(Thread.currentThread().getName() + ": " + sharedLog);
    })).start();
}
```

## Власний цикл подій

Щоб побачити, що всередині, реалізуємо виконавця з одним потоком і чергою задач:

```java
public final class EventLoop implements Executor, AutoCloseable {
    private final BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();
    private final Thread thread;
    private volatile boolean running = true;
    private static final Runnable POISON = () -> { };       // «отруйна пігулка» для зупинки

    public EventLoop(String name) {
        thread = Thread.ofPlatform().name(name).start(this::processQueue);
    }

    @Override
    public void execute(Runnable command) {
        if (!running) throw new RejectedExecutionException("цикл подій зупинено");
        queue.add(Objects.requireNonNull(command));
    }

    private void processQueue() {
        while (true) {
            Runnable task;
            try {
                task = queue.take();                        // чекає на наступну задачу
            } catch (InterruptedException e) {
                return;
            }
            if (task == POISON) return;
            try {
                task.run();
            } catch (RuntimeException e) {
                System.err.println("Виняток у циклі подій: " + e);   // одна задача не зупиняє цикл
            }
        }
    }

    public boolean inEventLoop() {
        return Thread.currentThread() == thread;
    }

    @Override
    public void close() throws InterruptedException {
        running = false;
        queue.add(POISON);                                  // доробити подані задачі й зупинитися
        thread.join();
    }
}
```

Тепер код з будь-якого потоку може виконати задачу в потоці циклу подій:

```java
try (EventLoop loop = new EventLoop("event-loop")) {
    Thread worker = Thread.ofPlatform().name("worker").start(() -> {
        System.out.println(Thread.currentThread().getName() + " стартував");
        loop.execute(() -> System.out.println("Повідомлення від worker, виконано в: "
                + Thread.currentThread().getName()));
    });

    loop.execute(() -> System.out.println("Повідомлення від main, виконано в: "
            + Thread.currentThread().getName()));
    worker.join();
}
// worker стартував
// Повідомлення від main, виконано в: event-loop
// Повідомлення від worker, виконано в: event-loop
```

Порядок перших двох повідомлень залежить від планувальника, але обидва виконуються в потоці `event-loop`. Саме так влаштовано EDT у Swing, цикли подій у Netty і Vert.x та «актори» в багатьох фреймворках.

## Продовження на заданому виконавці

Для асинхронних ланцюжків `CompletableFuture` (попередня сторінка) завжди можна вказати, **де** виконати наступний крок: методи з суфіксом `Async` приймають `Executor`:

```java
ExecutorService io = Executors.newVirtualThreadPerTaskExecutor();
EventLoop ui = new EventLoop("ui");

CompletableFuture
        .supplyAsync(() -> loadUser(id), io)                    // мережа — на віртуальних потоках
        .thenApplyAsync(User::displayName, io)
        .thenAcceptAsync(name -> render(name), ui)              // відображення — у потоці «UI»
        .exceptionallyAsync(ex -> { showError(ex); return null; }, ui);
```

Без суфікса `Async` (наприклад, `thenAccept`) продовження виконується в тому потоці, який завершив попередній етап, або в потоці, що додав продовження, якщо етап уже був завершений. Тому, коли важливо, де саме виконується код, виконавця передають явно.
