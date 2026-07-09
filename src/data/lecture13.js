export const lecture13 = {
  id: "13",
  title: "Wykład 13: Interoperacyjność Natywna i Blokowanie Wyłączne (Locks)",
  description: "Metody wywoływania kodu natywnego (JNI vs Linker API), Java Memory Model (JMM), słowo kluczowe volatile oraz blokowanie wyłączne (synchronized, ReentrantLock).",
  sections: [
    {
      title: "1. Komunikacja z Kodem Natywnym: JNI & Linker API",
      content: `
Czasami zachodzi potrzeba wywołania w Javie istniejących bibliotek napisanych w C/C++ (np. sterowników, bibliotek obliczeniowych). Służą do tego dwa mechanizmy:

### 1. JNI (Java Native Interface) - Klasyczny Standard:
Wymaga zadeklarowania metody ze słowem kluczowym \`native\`, wygenerowania nagłówków C/C++ (\`javac -h\`), napisania kodu pomostowego w C/C++ i skompilowania biblioteki współdzielonej (\`.dll\` lub \`.so\`).
* JNI wiąże się z dużym narzutem wydajnościowym na przełączanie kontekstu JVM-Native.
* Kod pomostowy w C/C++ jest trudny w utrzymaniu.

### 2. Linker API (Project Panama - Java 22+):
Modernizowany mechanizm pozwalający na bezpośrednie ładowanie bibliotek i wywoływanie ich funkcji bezpośrednio z poziomu Javy, bez pisania kodu pomostowego w C/C++.

Przykład wywołania funkcji \`strlen\` z biblioteki standardowej C za pomocą FFM Linkera:
\`\`\`java
// 1. Znajdź Linker i wyszukaj funkcję strlen
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MemorySegment strlenAddr = stdlib.find("strlen").orElseThrow();

// 2. Zdefiniuj sygnaturę metody (argumenty i zwracany typ)
FunctionDescriptor descriptor = FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS);

// 3. Stwórz uchwyt do metody (MethodHandle)
MethodHandle strlen = linker.downcallHandle(strlenAddr, descriptor);

// 4. Zaalokuj pamięć na napis C i wywołaj metodę
try (Arena arena = Arena.ofConfined()) {
    MemorySegment cString = arena.allocateFrom("Witaj z Java!");
    long length = (long) strlen.invokeExact(cString); // wywołanie natywne!
    System.out.println("Długość napisu: " + length); // 13
}
\`\`\`
`
    },
    {
      title: "2. Model Pamięci Java (JMM) i słowo kluczowe volatile",
      content: `
W systemach wieloprocesorowych każdy rdzeń ma własną pamięć podręczną (L1/L2/L3 Cache). Wątki mogą kopiować zmienne z pamięci głównej (RAM) do lokalnych pamięci podręcznych procesora. Prowadzi to do problemu **widoczności (visibility)**: zmiany wprowadzone przez jeden wątek mogą być niewidoczne dla innego.

Dodatkowo, kompilator i procesor mogą zmieniać kolejność wykonywania instrukcji (**instruction reordering**), o ile nie zmienia to wyniku w pojedynczym wątku.

**Java Memory Model (JMM)** definiuje zasady komunikacji między wątkami a pamięcią. Jedną z głównych instrukcji JMM jest słowo kluczowe **\`volatile\`**.

Użycie modyfikatora \`volatile\` przy polu klasy gwarantuje:
1. **Widoczność**: Każdy odczyt zmiennej volatile odbywa się bezpośrednio z pamięci głównej (RAM), a każdy zapis jest natychmiast do niej wypychany.
2. **Barierę pamięci (Memory Barrier)**: Zapobiega przestawianiu instrukcji (reordering) wokół zmiennej volatile.

\`\`\`java
public class SharedFlag {
    // volatile gwarantuje, że wątki natychmiast zobaczą zmianę flagi
    private volatile boolean active = true; 

    public void stop() { active = false; }
    
    public void runLoop() {
        while (active) {
            // wykonuj pracę
        }
    }
}
\`\`\`

> [!WARNING]
> \`volatile\` zapewnia spójność odczytu/zapisu pojedynczych zmiennych, ale **nie zapewnia atomowości** operacji złożonych (np. inkrementacja \`count++\` wymaga odczytu, modyfikacji i zapisu, co przy volatile nadal może prowadzić do race condition). Do operacji atomowych służą klasy z pakietu \`java.util.concurrent.atomic\` (np. \`AtomicInteger\`).
`
    },
    {
      title: "3. Blokowanie Wyłączne (Exclusive Locking)",
      content: `
Kiedy wiele wątków modyfikuje ten sam stan (np. pole klasy), zachodzi ryzyko wyścigu (**Race Condition**). Aby temu zapobiec, musimy zapewnić sekcjom krytycznym wzajemne wykluczanie (Mutual Exclusion).

### 1. Słowo kluczowe synchronized:
Najprostsza forma blokowania w Javie. Działa na poziomie monitora obiektu (każdy obiekt w Javie ma niejawny monitor lock).

* **Metoda synchronizowana**: Blokuje monitor obiektu \`this\` (dla metod instancji) lub monitor klasy (dla metod statycznych):
  \`\`\`java
  public synchronized void increment() {
      count++; // cała metoda staje się sekcją krytyczną
  }
  \`\`\`
* **Blok synchronizowany**: Blokuje tylko wybrany obiekt (monitor), co pozwala na zawężenie sekcji krytycznej (lepsza wydajność):
  \`\`\`java
  private final Object lock = new Object();
  
  public void updateData() {
      synchronized (lock) {
          count++; // tylko ten fragment jest zablokowany
      }
  }
  \`\`\`

### 2. Klasa ReentrantLock (java.util.concurrent.locks):
Nowocześniejszy, jawny mechanizm blokowania. Oferuje większe możliwości niż \`synchronized\`:
* Możliwość rezerwowania blokady z limitem czasu (\`tryLock()\`).
* Możliwość przerwania wątku oczekującego (\`lockInterruptibly()\`).
* Możliwość włączenia sprawiedliwego kolejkowania (Fair Lock - wątki dostają blokadę w kolejności zgłoszeń).

Użycie \`ReentrantLock\`:
\`\`\`java
private final ReentrantLock lock = new ReentrantLock();

public void performAction() {
    lock.lock(); // jawne zablokowanie
    try {
        // sekcja krytyczna (modyfikacja stanu)
    } finally {
        lock.unlock(); // bezwzględne zwolnienie w bloku finally!
    }
}
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Co gwarantuje oznaczenie pola klasy słowem kluczowym volatile w Javie?",
      options: [
        "Sprawia, że wszystkie metody w klasie stają się automatycznie synchronizowane.",
        "Gwarantuje, że zapisy i odczyty tego pola będą realizowane bezpośrednio z/do pamięci głównej (RAM) i zapobiega reorderingowi instrukcji.",
        "Zabezpiecza pole przed dostępem poprzez refleksję.",
        "Zezwala na przeciążanie operatorów na tym polu."
      ],
      answer: 1,
      explanation: "Oznaczenie volatile zapewnia widoczność zmian między wątkami (dane nie są buforowane w lokalnym cache procesora) oraz wstawia bariery pamięciowe dla kompilatora."
    },
    {
      question: "Dlaczego operacja inkrementacji 'count++' na polu 'volatile int count' nie jest bezpieczna wątkowo (thread-safe)?",
      options: [
        "Ponieważ volatile działa tylko na obiektach, a nie na typach prostych.",
        "Ponieważ operacja count++ składa się z trzech etapów (odczyt, dodanie, zapis), a volatile gwarantuje atomowość jedynie dla pojedynczych odczytów i zapisów.",
        "Ponieważ kompilator usuwa tę instrukcję z kodu bajtowego.",
        "W rzeczywistości jest bezpieczna wątkowo."
      ],
      answer: 1,
      explanation: "Volatile nie zapewnia atomowości. Inkrementacja jest operacją złożoną. Jeśli dwa wątki odczytają tę samą wartość jednocześnie, oba zapiszą tę samą wartość zwiększoną o 1, gubiąc jedną operację."
    },
    {
      question: "Jaka jest kluczowa różnica między ReentrantLock a synchronized?",
      options: [
        "ReentrantLock działa automatycznie bez bloku try-finally.",
        "synchronized jest szybszy w każdej sytuacji.",
        "ReentrantLock pozwala na próby blokowania z limitem czasu (tryLock()) oraz sprawiedliwe kolejkowanie wątków, czego synchronized nie potrafi.",
        "ReentrantLock można używać tylko w interfejsach."
      ],
      answer: 2,
      explanation: "ReentrantLock daje programiście pełną, programistyczną kontrolę nad blokowaniem, m.in. poprzez tryLock(), co pozwala uniknąć zakleszczeń (deadlocks)."
    }
  ]
};
