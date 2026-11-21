---
title: Асинхронні послідовності
description: Послідовності, елементи яких надходять з очікуванням, блокувальні ітератори на віртуальних потоках, черга виробник–споживач, Flow API — Publisher, Subscriber, Subscription і зворотний тиск, SubmissionPublisher, власний видавець, скасування, оператори реактивних бібліотек.
---

## Задача

Звичайний `Iterator` повертає елементи **одразу**. Але буває, що на **кожен** елемент треба чекати: рядки, що надходять мережею, повідомлення з черги, результати сторінкових запитів до API, події від датчика. Такі послідовності називають **асинхронними**.

> [!NOTE]
> Якщо чекати треба лише на всю колекцію, а не на кожен елемент окремо, достатньо `CompletableFuture<List<T>>`. Асинхронна послідовність потрібна, коли елементи слід обробляти **в міру надходження**.

У Java є два підходи:

* **блокувальний ітератор на віртуальному потоці** — `next()` просто чекає на елемент, і завдяки віртуальним потокам це дешево;
* **реактивні потоки** (reactive streams) — видавець «штовхає» елементи підписникові, а той керує темпом через **зворотний тиск** (backpressure). Стандартні інтерфейси — `java.util.concurrent.Flow` (Java 9).

## Блокувальна послідовність

Аналог асинхронного генератора `range(from, to, delay)`, що видає числа із затримкою. На віртуальних потоках очікування в `next()` не займає потоку ОС:

```java
static Iterable<Integer> rangeWithDelay(int from, int to, Duration delay) {
    return () -> new Iterator<>() {
        private int current = from;

        @Override
        public boolean hasNext() {
            return current < to;
        }

        @Override
        public Integer next() {
            if (!hasNext()) throw new NoSuchElementException();
            try {
                Thread.sleep(delay);                  // «чекаємо» на наступний елемент
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new CancellationException("перервано");
            }
            return current++;
        }
    };
}

Thread.ofVirtual().start(() -> {
    for (int i : rangeWithDelay(0, 100, Duration.ofMillis(50))) {
        System.out.println(i);
    }
}).join();
```

Скасування — через переривання потоку, що ітерує: `Thread.sleep` (як і будь-яке блокувальне очікування) кидає `InterruptedException`.

### Виробник і споживач

Коли елементи виробляє інший потік (наприклад, слухач мережі), послідовність будують на **блокувальній черзі**. Обмежена місткість черги — найпростіший зворотний тиск: швидкий виробник блокується на `put`, доки споживач не встигне.

```java
BlockingQueue<Optional<String>> queue = new ArrayBlockingQueue<>(16);   // Optional.empty() — кінець

Thread producer = Thread.ofVirtual().start(() -> {
    try {
        for (String line : fetchLinesFromNetwork()) {
            queue.put(Optional.of(line));           // блокується, якщо черга повна
        }
        queue.put(Optional.empty());
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});

Stream.generate(() -> {
            try {
                return queue.take();                // блокується, якщо черга порожня
            } catch (InterruptedException e) {
                throw new CancellationException();
            }
        })
        .takeWhile(Optional::isPresent)
        .map(Optional::get)
        .filter(line -> !line.isBlank())
        .forEach(System.out::println);
```

Вся сила Stream API (`filter`, `map`, `takeWhile`, `limit`) доступна, бо з погляду споживача це звичайна, хоч і повільна, послідовність.

## Flow API

Пакет `java.util.concurrent.Flow` визначає чотири інтерфейси специфікації **Reactive Streams**, спільні для всіх реактивних бібліотек:

```java
public final class Flow {
    public interface Publisher<T> {
        void subscribe(Subscriber<? super T> subscriber);
    }

    public interface Subscriber<T> {
        void onSubscribe(Subscription subscription);   // спершу — один раз
        void onNext(T item);                           // 0..n разів
        void onError(Throwable throwable);             // кінець з помилкою
        void onComplete();                             // або успішний кінець
    }

    public interface Subscription {
        void request(long n);                          // «готовий прийняти ще n елементів»
        void cancel();                                 // відписатися
    }

    public interface Processor<T, R> extends Subscriber<T>, Publisher<R> { }
}
```

Протокол:

1. Підписник викликає `publisher.subscribe(subscriber)`, видавець відповідає `onSubscribe(subscription)`.
2. Підписник запитує елементи: `subscription.request(n)`. **Видавець не має права надіслати більше, ніж запитано**. Це і є зворотний тиск: повільний споживач не буде «затоплений».
3. Видавець викликає `onNext` для кожного елемента, а наприкінці рівно один раз `onComplete` або `onError`.
4. Підписник будь-коли може викликати `subscription.cancel()`.

> [!IMPORTANT]
> Виклики `onNext`, `onError` і `onComplete` для одного підписника відбуваються **послідовно**, ніколи одночасно. Тому всередині підписника не потрібна синхронізація його власного стану.

### SubmissionPublisher

Готова реалізація видавця — `SubmissionPublisher<T>`: метод `submit(item)` розсилає елемент усім підписникам, кожному в його власному буфері, а доставка відбувається в пулі потоків (за замовчуванням спільному). Якщо буфер підписника заповнений, `submit` **блокується**.

```java
class PrintingSubscriber implements Flow.Subscriber<Integer> {
    private Flow.Subscription subscription;

    @Override public void onSubscribe(Flow.Subscription subscription) {
        this.subscription = subscription;
        subscription.request(1);                       // по одному елементу
    }

    @Override public void onNext(Integer item) {
        System.out.println("Отримано: " + item);
        subscription.request(1);                       // готовий до наступного
    }

    @Override public void onError(Throwable throwable) {
        System.err.println("Помилка: " + throwable);
    }

    @Override public void onComplete() {
        System.out.println("Кінець");
    }
}

try (SubmissionPublisher<Integer> publisher = new SubmissionPublisher<>()) {
    publisher.subscribe(new PrintingSubscriber());
    for (int i = 0; i < 10; i++) {
        Thread.sleep(50);
        publisher.submit(i);
    }
}   // close() -> onComplete у підписників
Thread.sleep(200);                                     // дати доставці завершитися (демонстрація)
```

Для простих випадків замість власного підписника є `publisher.consume(item -> ...)`: він повертає `CompletableFuture<Void>`, що завершується разом з потоком.

```java
CompletableFuture<Void> done = publisher.consume(i -> System.out.println("Отримано: " + i));
// ... submit ..., close()
done.join();
```

### Власний видавець

Видавець, що видає числа із затримкою й поважає `request(n)` та `cancel()`:

```java
class RangePublisher implements Flow.Publisher<Integer> {
    private final int from, to;
    private final Duration delay;

    RangePublisher(int from, int to, Duration delay) {
        this.from = from;
        this.to = to;
        this.delay = delay;
    }

    @Override
    public void subscribe(Flow.Subscriber<? super Integer> subscriber) {
        AtomicLong requested = new AtomicLong();
        AtomicBoolean cancelled = new AtomicBoolean();
        Object signal = new Object();

        subscriber.onSubscribe(new Flow.Subscription() {
            @Override public void request(long n) {
                if (n <= 0) {
                    cancelled.set(true);
                    subscriber.onError(new IllegalArgumentException("n має бути > 0"));
                    return;
                }
                requested.accumulateAndGet(n, (a, b) -> a + b < 0 ? Long.MAX_VALUE : a + b);
                synchronized (signal) { signal.notifyAll(); }
            }

            @Override public void cancel() {
                cancelled.set(true);
                synchronized (signal) { signal.notifyAll(); }
            }
        });

        Thread.ofVirtual().start(() -> {
            try {
                for (int i = from; i < to && !cancelled.get(); i++) {
                    synchronized (signal) {
                        while (requested.get() == 0 && !cancelled.get()) signal.wait();   // зворотний тиск
                    }
                    if (cancelled.get()) return;
                    Thread.sleep(delay);
                    requested.decrementAndGet();
                    subscriber.onNext(i);
                }
                if (!cancelled.get()) subscriber.onComplete();
            } catch (InterruptedException e) {
                subscriber.onError(e);
            }
        });
    }
}
```

> [!NOTE]
> Коректно реалізувати `Publisher` складно: специфікація Reactive Streams має понад 40 правил (порядок сигналів, переповнення лічильника, повторні підписки). На практиці видавців беруть з бібліотек, а самі пишуть лише підписників.

### Скасування

Підписник відписується через `subscription.cancel()`, наприклад, після певної кількості елементів або за тайм-аутом:

```java
class FirstN implements Flow.Subscriber<Integer> {
    private final int limit;
    private int received;
    private Flow.Subscription subscription;

    FirstN(int limit) { this.limit = limit; }

    @Override public void onSubscribe(Flow.Subscription s) {
        subscription = s;
        s.request(limit);
    }

    @Override public void onNext(Integer item) {
        System.out.println(item);
        if (++received == limit) {
            subscription.cancel();
            System.out.println("Скасовано після " + limit + " елементів");
        }
    }

    @Override public void onError(Throwable t) { t.printStackTrace(); }
    @Override public void onComplete() { System.out.println("Кінець"); }
}

new RangePublisher(0, 100, Duration.ofMillis(50)).subscribe(new FirstN(5));
```

## Оператори: реактивні бібліотеки

`Flow` визначає лише протокол, а операторів на зразок `filter` чи `map` у JDK немає. Їх надають бібліотеки, сумісні з `Flow` і між собою: **Project Reactor** (основа Spring WebFlux), **RxJava**, **Mutiny**. Приклад на Reactor:

```java
Flux.range(0, 100)
        .delayElements(Duration.ofMillis(50))          // асинхронна послідовність
        .filter(x -> x % 2 == 0)
        .map(x -> x * x)
        .take(Duration.ofMillis(2500))                 // скасування за часом
        .subscribe(
                x -> System.out.println(x),
                error -> System.err.println("Помилка: " + error),
                () -> System.out.println("Кінець"));

List<Integer> squares = Flux.range(0, 10)
        .filter(x -> x % 2 == 0)
        .flatMap(x -> Mono.fromCallable(() -> x * x).delayElement(Duration.ofMillis(10)))   // асинхронне перетворення
        .collectList()
        .block();                                      // 0, 4, 16, 36, 64 (порядок flatMap не гарантований)
```

Перетворення між світами: `JdkFlowAdapter.flowPublisherToFlux(publisher)` і `JdkFlowAdapter.publisherToFlowPublisher(flux)` у Reactor, `FlowAdapters` у бібліотеці `reactive-streams`.

> [!TIP]
> Реактивні бібліотеки потужні, але складні для налагодження: стек викликів не показує логіку програми. Якщо зворотний тиск і складні оператори не потрібні, на віртуальних потоках простіше звичайний блокувальний код з чергами.
