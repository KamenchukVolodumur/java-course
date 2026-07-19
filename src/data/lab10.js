export const lab10 = {
  id: "Lab10",
  title: "Лабораторна 10: Multithreaded Order Book (Біржовий Стакан)",
  description: "Низькорівнева багатопоточність: спільний стан, Race Conditions, ReentrantLock, Atomic змінні та Thread Pools на прикладі ядра криптовалютної біржі.",
  sections: [
    {
      title: "Опис завдання",
      content: `
> [!NOTE]
> **Рекомендовані лекції для цієї лаби:** Лекції 13 та 14 (Java Memory Model, Synchronized, Locks, Concurrent Collections).

Уявіть, що ви працюєте в Binance. Ваше завдання — написати ядро біржі (Matching Engine). 
До вас одночасно підключаються тисячі трейдерів. Одні хочуть купити біткоїн (Buy Bids), інші — продати (Sell Asks). Всі вони одночасно викликають метод \`submitOrder\`.

Якщо ви використаєте звичайний \`ArrayList\` без синхронізації, два трейдери можуть купити один і той самий біткоїн, або програма впаде з \`ConcurrentModificationException\`.
Ваша мета — створити потокобезпечний (Thread-safe) "Біржовий стакан" (Order Book), використовуючи сучасні примітиви синхронізації.
`
    },
    {
      title: "Task 1: Модель Ордера та Атомарність (1 бал)",
      content: `
Спершу створимо базові типи. Ордер (заявка) має тип, ціну, кількість і унікальний ID.

Оскільки тисячі потоків будуть створювати ордери одночасно, звичайний лічильник \`id++\` не спрацює (це операція з 3 кроків: прочитати, додати, записати — тут станеться Race Condition). Ми використаємо **AtomicLong**.

\`\`\`java
import java.util.concurrent.atomic.AtomicLong;

public enum OrderType {
    BUY, SELL
}

public record Order(long id, OrderType type, double price, int quantity) {}

public class OrderFactory {
    // Klasa narzędziowa do generowania unikalnych ID bezpiecznie dla wątków
    private static final AtomicLong idGenerator = new AtomicLong(1);

    public static Order createOrder(OrderType type, double price, int quantity) {
        // TODO: Użyj metody .getAndIncrement() na idGenerator, 
        // aby uzyskać unikalne ID i stworzyć nowy obiekt Order.
        return null;
    }
}
\`\`\`
`
    },
    {
      title: "Task 2: Структура Стакану та ReentrantLock (2 бали)",
      content: `
Створимо клас \`OrderBook\`. Він зберігатиме дві черги з пріоритетом (\`PriorityQueue\`):
1. **Bids (Покупці):** Сортується за спаданням ціни (найвижча ціна перша — бо біржа хоче продати якомога дорожче).
2. **Asks (Продавці):** Сортується за зростанням ціни (найнижча ціна перша).

Щоб захистити ці черги від одночасного доступу, використаємо \`ReentrantLock\`.

\`\`\`java
import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.concurrent.locks.ReentrantLock;

public class OrderBook {
    // Kolejka kupujących (najwyższa cena na szczycie)
    private final PriorityQueue<Order> bids = new PriorityQueue<>(
            Comparator.comparingDouble(Order::price).reversed()
    );
    
    // Kolejka sprzedających (najniższa cena na szczycie)
    private final PriorityQueue<Order> asks = new PriorityQueue<>(
            Comparator.comparingDouble(Order::price)
    );

    // Zamek chroniący nasze kolejki przed Race Conditions
    private final ReentrantLock lock = new ReentrantLock();

    // Słowo 'volatile' gwarantuje, że zmiana tej zmiennej przez jeden wątek 
    // jest natychmiast widoczna dla wszystkich innych wątków!
    private volatile double lastTradedPrice = 0.0;

    public void submitOrder(Order order) {
        // TODO 1: Zablokuj zamek (lock.lock())
        try {
            // TODO 2: W zależności od order.type() dodaj zamówienie do 'bids' albo 'asks'
            
            // TODO 3: Wywołaj metodę matchOrders() (którą napiszemy w Task 3)
            
        } finally {
            // TODO 4: ZAWSZE zwalniaj zamek w bloku finally! (lock.unlock())
            // Jeśli wystąpi wyjątek, a zamek nie zostanie zwolniony, 
            // CAŁY SERWER zawiesi się na zawsze (Deadlock).
        }
    }

    public double getLastTradedPrice() {
        return lastTradedPrice;
    }
}
\`\`\`
`
    },
    {
      title: "Task 3: Matching Engine (Критична секція) (2 бали)",
      content: `
Метод \`matchOrders()\` запускається щоразу, коли додається новий ордер. Він намагається знайти пару.
*Увага: цей метод є приватним і викликається ТІЛЬКИ з \`submitOrder\`, отже, він вже захищений нашим \`lock\`!*

\`\`\`java
private void matchOrders() {
    // Pętla działa dopóki mamy zarówno kupujących jak i sprzedających
    while (!bids.isEmpty() && !asks.isEmpty()) {
        Order topBid = bids.peek();
        Order topAsk = asks.peek();

        // Jeśli najwyższa oferta kupna jest równa lub większa 
        // od najniższej oferty sprzedaży -> MAMY DEAL!
        if (topBid.price() >= topAsk.price()) {
            
            // TODO 1: Zdejmij oba zamówienia z kolejek (użyj .poll())
            
            // W naszym uproszczonym modelu zakładamy, że quantity to zawsze 1 
            // (w prawdziwej giełdzie musielibyśmy rozliczać częściowe transakcje).
            
            // TODO 2: Ustaw lastTradedPrice na cenę sprzedającego (topAsk.price())
            
            System.out.printf("TRANSAKCJA: Kupujący #%d kupił od Sprzedającego #%d po cenie %.2f\\n",
                    topBid.id(), topAsk.id(), lastTradedPrice);
        } else {
            // Ceny się nie krzyżują, przerywamy pętlę
            break;
        }
    }
}
\`\`\`
`
    },
    {
      title: "Task 4: Симуляція Трейдерів (Thread Pool) (1 бал)",
      content: `
Залишилося запустити нашу біржу і піддати її жорсткому стрес-тесту! 
Ми використаємо \`ExecutorService\` (Пул потоків), щоб зімітувати 100 трейдерів, які одночасно відправляють ордери.

\`\`\`java
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        OrderBook orderBook = new OrderBook();
        Random random = new Random();
        
        // Tworzymy pulę 20 wątków roboczych (20 jednoczesnych traderów)
        ExecutorService executor = Executors.newFixedThreadPool(20);

        System.out.println("Giełda otwarta. Rozpoczynamy handel...");

        // Zlecenie 1000 losowych operacji
        for (int i = 0; i < 1000; i++) {
            executor.submit(() -> {
                OrderType type = random.nextBoolean() ? OrderType.BUY : OrderType.SELL;
                // Generujemy cenę między 90.0 a 110.0
                double price = 90.0 + (random.nextDouble() * 20.0);
                
                Order order = OrderFactory.createOrder(type, Math.round(price * 100.0) / 100.0, 1);
                orderBook.submitOrder(order);
            });
        }

        // Zamykamy przyjmowanie nowych zadań
        executor.shutdown();
        
        // Czekamy maksymalnie 10 sekund na zakończenie wszystkich operacji
        executor.awaitTermination(10, TimeUnit.SECONDS);

        System.out.println("Giełda zamknięta.");
        System.out.println("Ostatnia cena transakcyjna: " + orderBook.getLastTradedPrice());
        
        // Jeśli dojdziesz do tego miejsca i nie zobaczysz żadnego błędu w konsoli, 
        // to znaczy, że poprawnie zsynchronizowałeś współdzielony stan!
    }
}
\`\`\`

> [!TIP]
> Спробуйте заради експерименту закоментувати \`lock.lock()\` та \`lock.unlock()\` у методі \`submitOrder\`. Запустіть програму кілька разів. Ви побачите хаос: ордери губляться, транзакції дублюються, а консоль може вибухнути помилкою \`ConcurrentModificationException\`. Це і є **Race Condition**.
`
    }
  ],
  quiz: [
    {
      question: "Dlaczego w klasie OrderFactory zastosowano AtomicLong (metodę getAndIncrement()) zamiast zwykłego 'long id = 0; id++;'?",
      options: [
        "Ponieważ AtomicLong pozwala na przechowywanie większych liczb niż zwykły typ prymitywny long.",
        "Operacja 'id++' składa się pod maską z 3 kroków: odczyt, dodanie, zapis. Gdy 100 wątków wykonuje to jednocześnie, nadpisują swoje wyniki. AtomicLong wykonuje to jako jedną, nierozerwalną operację procesora (CAS - Compare-And-Swap).",
        "Zwykły long nie może być używany w statycznych metodach interfejsów.",
        "Jest to wymóg interfejsu ExecutorService do rozróżniania zadań."
      ],
      answer: 1,
      explanation: "Race Condition na licznikach to klasyczny błąd. Dwa wątki mogą odczytać id=5 w tym samym ułamku sekundy, oba zwiększą go do 6 i zapiszą. W efekcie jeden ID zaginie. AtomicLong temu zapobiega bez użycia powolnych 'locków'."
    },
    {
      question: "Dlaczego zwalnianie zamka (lock.unlock()) BEZWZGLĘDNIE musi znajdować się w bloku 'finally'?",
      options: [
        "Ponieważ kompilator Javy nie skompiluje kodu, jeśli lock.unlock() jest w zwykłym bloku try.",
        "Blok finally wywołuje się zawsze. Jeśli np. metoda add() w kolekcji rzuci NullPointerException i aplikacja przerwie działanie, zamek w finally i tak zostanie zwolniony. Gdybyśmy nie użyli finally, zamek zostałby zamknięty na zawsze, powodując Deadlock całego serwera.",
        "Ponieważ blok finally wykonuje się asynchronicznie, co przyspiesza działanie aplikacji.",
        "Zamek sam zwalnia się po 3 sekundach, finally po prostu robi to natychmiast."
      ],
      answer: 1,
      explanation: "Jest to złota zasada Javy. ReentrantLock nie ma wbudowanego timeoutu. Zgubienie (niezwolnienie) zamka to jeden z najtrudniejszych do znalezienia błędów krytycznych na produkcji."
    },
    {
      question: "Co daje słowo kluczowe 'volatile' przy zmiennej 'lastTradedPrice'?",
      options: [
        "Sprawia, że zmienna jest tylko do odczytu (odpowiednik słowa 'final' w nowoczesnej Javie).",
        "Chroni przed sytuacją, w której dwa wątki jednocześnie próbują przypisać wartość, działając jak mutex (blokada).",
        "Gwarantuje, że gdy jeden wątek zmodyfikuje tę wartość, zmiana ta zostanie od razu zapisana do pamięci RAM głównej (a nie tylko do lokalnej pamięci cache procesora L1/L2), przez co inne wątki od razu zobaczą nową wartość.",
        "Zwiększa szybkość operacji arytmetycznych na tej zmiennej poprzez kompilację JIT."
      ],
      answer: 2,
      explanation: "Słowo 'volatile' rozwiązuje problem 'Widoczności' (Visibility) w Java Memory Model. Zmusza wątki do pobierania zawsze świeżej wartości bezpośrednio z Main Memory. NIE chroni jednak przed Race Conditions (jak Atomic)."
    },
    {
      question: "Jaka jest różnica między użyciem 'ReentrantLock', a starszym słowem kluczowym 'synchronized'?",
      options: [
        "Nie ma żadnej różnicy, ReentrantLock to tylko nowsza nazwa na synchronized z Javy 8.",
        "synchronized jest znacznie szybsze i nie blokuje wątków, natomiast ReentrantLock jest operacją wejścia/wyjścia.",
        "ReentrantLock pozwala m.in. na spróbowanie założenia zamka (tryLock()), które nie zawiesza wątku na wieki jeśli zamek jest zajęty, oraz pozwala na zakładanie i zwalnianie zamka w różnych metodach. synchronized jest prostsze, ale zablokowane na jednym bloku.",
        "synchronized używamy tylko dla typów prostych (int, boolean), a ReentrantLock dla obiektów."
      ],
      answer: 2,
      explanation: "Oba mechanizmy zapewniają tzw. Mutual Exclusion (wzajemne wykluczanie). Jednak ReentrantLock z pakietu java.util.concurrent.locks daje programiście 'manualną' i znacznie bardziej elastyczną kontrolę nad blokadą."
    }
  ]
};
