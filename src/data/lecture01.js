export const lecture01 = {
  id: "01",
  title: "Wykład 01: Wstęp, Ekosystem JVM & System Typów",
  description: "Wprowadzenie do języka Java, wirtualnej maszyny JVM, systemów budowania projektów (Maven, Gradle) oraz fundamentalnego systemu typów (typy proste i referencyjne).",
  sections: [
    {
      title: "1. Język Java i platforma JVM",
      content: `
Język Java został stworzony w firmie **Sun Microsystems** przez zespół pod kierownictwem **Jamesa Goslinga** i oficjalnie wydany w **1996 roku**. Od 2010 roku, po przejęciu Sun Microsystems, właścicielem i głównym deweloperem platformy jest **Oracle**. Filozofia Java opiera się na haśle **"Write Once, Run Anywhere" (WORA)**, co oznacza, że raz skompilowany program powinien działać bez zmian na dowolnej platformie sprzętowej i systemowej posiadającej środowisko uruchomieniowe Java.

W przeciwieństwie do języków kompilowanych bezpośrednio do kodu maszynowego (jak C++), Java wykorzystuje architekturę dwuetapową:
1. **Kompilacja**: Kod źródłowy (\`.java\`) jest kompilowany przez kompilator \`javac\` do kodu pośredniego, zwanego **kodem bajtowym (Bytecode)**, i zapisywany w plikach \`.class\`.
2. **Uruchomienie**: Wirtualna Maszyna Javy (**JVM - Java Virtual Machine**) interpretuje lub kompiluje w locie kod bajtowy do kodu maszynowego konkretnego procesora.

### Elementy Ekosystemu Java:
* **JVM (Java Virtual Machine)**: Rdzeń platformy odpowiedzialny za wykonywanie kodu bajtowego, zarządzanie pamięcią (Garbage Collector), ładowanie klas i bezpieczeństwo.
* **JRE (Java Runtime Environment)**: Środowisko uruchomieniowe. Zawiera JVM oraz standardowe biblioteki uruchomieniowe niezbędne do uruchomienia programu. Od Javy 11 JRE nie jest już dystrybuowane jako osobny pakiet instalacyjny – instaluje się pełne JDK.
* **JDK (Java Development Kit)**: Zestaw narzędzi programistycznych. Zawiera JRE oraz narzędzia takie jak kompilator (\`javac\`), debugger (\`jdb\`), dokumentator (\`javadoc\`) i pakiety diagnostyczne.
`
    },
    {
      title: "2. Jak działa kompilacja JIT i zarządzanie pamięcią",
      content: `
Wykonanie kodu bajtowego przez JVM odbywa się na dwa sposoby w celu optymalizacji wydajności:
* **Interpretacja**: JVM czyta instrukcje kodu bajtowego jedna po drugiej i tłumaczy na instrukcje procesora. Jest to proces wolny.
* **Kompilacja JIT (Just-In-Time)**: Analizator JVM wykrywa tzw. "gorące sekcje" (hotspots) – często uruchamiane pętle lub metody. Kompilator JIT (np. C1 lub C2 w maszynie HotSpot) kompiluje te fragmenty bezpośrednio do wysoce zoptymalizowanego kodu maszynowego danej platformy i zapisuje je w pamięci podręcznej (Code Cache). Kolejne wywołania są wykonywane z prędkością kodu natywnego.

Zarządzaniem pamięcią zajmuje się **Garbage Collector (GC)**. Programista Java nie alokuje ani nie zwalnia pamięci ręcznie (nie ma operatora \`delete\` ani \`free\`). Obiekty są tworzone na stercie (Heap) za pomocą słowa kluczowego \`new\`, a GC automatycznie wykrywa i usuwa obiekty, do których nie prowadzą już referencje. Zapobiega to wyciekom pamięci (Memory Leaks) i błędom typu *use-after-free*, aczkolwiek może powodować krótkie pauzy w działaniu aplikacji (tzw. *Stop-The-World*).
`
    },
    {
      title: "3. Narzędzia budowania projektów: Maven i Gradle",
      content: `
W ekosystemie Java standardem zarządzania projektami, zależnościami (bibliotekami zewnętrznymi) i cyklem życia aplikacji są systemy budowania. Dwa najpopularniejsze z nich to **Apache Maven** oraz **Gradle**. Zastępują one mechanizmy budowania IDE i pozwalają na automatyzację procesów CI/CD.

### Apache Maven:
Opiera się na podejściu deklaratywnym oraz koncepcji "konwencji ponad konfiguracją" (Convention over Configuration). Strukturę projektu definiuje plik XML o nazwie \`pom.xml\` (Project Object Model).

Przykładowy plik \`pom.xml\`:
\`\`\`xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>pl.edu.pw.mini</groupId>
    <artifactId>java-app</artifactId>
    <version>1.0.0</version>
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>
    <dependencies>
        <dependency>
            <groupId>com.google.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>
    </dependencies>
</project>
\`\`\`

### Gradle:
Nowocześniejsze, wydajniejsze i bardziej elastyczne narzędzie, które zamiast XML używa języka DSL (Domain Specific Language) opartego na Groovy lub Kotlin. Konfiguracja znajduje się w pliku \`build.gradle\` lub \`build.gradle.kts\`.

Przykładowy plik \`build.gradle.kts\` (Kotlin DSL):
\`\`\`kotlin
plugins {
    java
}

group = "pl.edu.pw.mini"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.google.code.gson:gson:2.10.1")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}

tasks.withType<JavaCompile> {
    sourceCompatibility = "21"
    targetCompatibility = "21"
}
\`\`\`
`
    },
    {
      title: "4. System Typów w Javie",
      content: `
Java jest językiem **silnie typowanym (strongly typed)**, co oznacza, że każda zmienna musi mieć zadeklarowany typ przed użyciem, a poprawność typów jest rygorystycznie sprawdzana podczas kompilacji.

W Javie system typów dzieli się na dwie główne kategorie:
1. **Typy proste (Primitive Types)**
2. **Typy referencyjne (Reference Types)**

### Typy proste (Primitive Types):
Są wbudowane w język i przechowują bezpośrednio wartości. Zmienne lokalne typów prostych są alokowane na stosie (Stack), co zapewnia bardzo szybki dostęp. Natomiast pola typów prostych będące częścią obiektów są alokowane na stercie (Heap) razem z obiektem, do którego należą. Java posiada dokładnie 8 typów prostych:

| Typ | Rozmiar (bity) | Domyślna wartość | Zakres wartości |
| :--- | :--- | :--- | :--- |
| \`byte\` | 8 | 0 | -128 do 127 |
| \`short\` | 16 | 0 | -32,768 do 32,767 |
| \`int\` | 32 | 0 | -2^31 do 2^31 - 1 |
| \`long\` | 64 | 0L | -2^63 do 2^63 - 1 |
| \`float\` | 32 | 0.0f | Zmiennoprzecinkowy pojedynczej precyzji |
| \`double\` | 64 | 0.0d | Zmiennoprzecinkowy podwójnej precyzji |
| \`char\` | 16 | '\\u0000' | Pojedynczy znak Unicode (UTF-16) |
| \`boolean\` | ~8 (w praktyce zależy od JVM) | false | \`true\` lub \`false\` |

### Typy referencyjne (Reference Types):
Służą do reprezentowania obiektów, tablic i interfejsów. Zmienna referencyjna nie przechowuje obiektu bezpośrednio, lecz **referencję (adres w pamięci)** do obiektu alokowanego na stercie (Heap). Wszystkie typy referencyjne dziedziczą po klasie \`java.lang.Object\`.
* Wartością domyślną dla każdej referencji jest \`null\`, co oznacza, że referencja nie wskazuje na żaden obiekt.
* Próba wywołania metody na referencji o wartości \`null\` skutkuje wyrzuceniem wyjątku \`NullPointerException\` (NPE).

### Klasy osłonowe (Wrapper Classes) i Autoboxing:
Dla każdego typu prostego istnieje odpowiadający mu typ referencyjny (klasa osłonowa), np. \`Integer\` dla \`int\`, \`Double\` dla \`double\`, \`Boolean\` dla \`boolean\`.
* **Autoboxing**: Automatyczna konwersja typu prostego na obiekt klasy osłonowej (np. \`Integer x = 5;\`).
* **Unboxing**: Automatyczne wyciąganie wartości prostej z obiektu osłonowego (np. \`int y = x;\`).

> [!WARNING]
> Autoboxing i unboxing zachodzą niejawnie i mogą powodować problemy wydajnościowe (np. w pętlach o dużej liczbie iteracji) z powodu ciągłego tworzenia nowych obiektów na stercie oraz ryzyko \`NullPointerException\` przy próbie unboxingu referencji o wartości \`null\`.
`
    },
    {
      title: "5. Hello World w Javie",
      content: `
Klasyczny program w Javie wymaga zdefiniowania klasy publicznej, której nazwa musi dokładnie odpowiadać nazwie pliku. Punktem wejścia aplikacji jest metoda statyczna \`main\`.

\`\`\`java
// Hello.java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

W Javie 21 jako funkcja preview pojawiła się możliwość pisania uproszczonych programów bez jawnej deklaracji klasy (JEP 445). Funkcjonalność ta została sfinalizowana w **Javie 23** (JEP 477) pod nazwą **Implicitly Declared Classes and Instance Main Methods**, co pozwala na uproszczenie kodu dla początkujących:

\`\`\`java
// Hello.java (Java 23+, preview od Java 21)
void main() {
    System.out.println("Hello, World!");
}
\`\`\`

Aby uruchomić plik bezpośrednio z linii komend (bez jawnego tworzenia plików class od Javy 11):
\`\`\`bash
java Hello.java
\`\`\`
`
    },
    {
      title: "6. Pakiety (Packages) i import",
      content: `
Pakiety w Javie pełnią rolę analogiczną do przestrzeni nazw (namespaces) w C#. Służą do logicznej organizacji klas i zapobiegania konfliktom nazw.

### Deklaracja pakietu:
Pierwsza instrukcja w pliku źródłowym (poza komentarzami) musi deklarować pakiet, do którego należy dana klasa:
\`\`\`java
package pl.edu.pw.mini.app;

public class MyApp { ... }
\`\`\`

Konwencja nazewnictwa pakietów to odwrócona domena organizacji (np. \`pl.edu.pw.mini\`). Struktura pakietów **musi odpowiadać strukturze katalogów** na dysku — klasa \`pl.edu.pw.mini.app.MyApp\` musi znajdować się w pliku \`pl/edu/pw/mini/app/MyApp.java\`.

### Import klas:
\`\`\`java
import java.util.List;              // Import pojedynczej klasy
import java.util.*;                  // Import wszystkich klas z pakietu (niezalecane)
import static java.lang.Math.PI;    // Import statyczny — pozwala pisać PI zamiast Math.PI
import static java.lang.Math.*;     // Import statyczny wszystkich stałych i metod Math
\`\`\`

> [!NOTE]
> Klasy z pakietu \`java.lang\` (np. \`String\`, \`Integer\`, \`System\`, \`Math\`) są importowane automatycznie i nie wymagają jawnej instrukcji \`import\`.
`
    },
    {
      title: "7. Zmienne, var, final i Rzutowanie Typów",
      content: `
### Deklaracja zmiennych:
W Javie każda zmienna musi mieć jawnie zadeklarowany typ (lub użyć wnioskowania typu \`var\`):
\`\`\`java
int age = 25;
String name = "Anna";
double pi = 3.14159;
\`\`\`

### Słowo kluczowe var (Java 10+):
Od Javy 10 dostępne jest wnioskowanie typu dla zmiennych lokalnych za pomocą słowa kluczowego \`var\`. Kompilator sam określa typ na podstawie wartości inicjalizacyjnej:
\`\`\`java
var count = 10;                  // int
var names = new ArrayList<String>(); // ArrayList<String>
var stream = Files.lines(path);  // Stream<String>
\`\`\`

> [!WARNING]
> \`var\` działa **wyłącznie ze zmiennymi lokalnymi** — nie można go stosować do pól klas, parametrów metod ani typów zwracanych. Zmienna musi być natychmiast zainicjalizowana.

### Słowo kluczowe final:
\`final\` to modyfikator oznaczający niezmienność:
* **Zmienna final**: Raz przypisana wartość nie może być zmieniona (odpowiednik \`const\`/\`readonly\`).
* **Metoda final**: Nie może być nadpisana (\`@Override\`) w podklasach.
* **Klasa final**: Nie można po niej dziedziczyć (np. \`String\`, \`Integer\` — są final).

\`\`\`java
final int MAX_SIZE = 100;      // Stała — nie można zmienić
final List<String> list = new ArrayList<>();
list.add("ok");                // DOZWOLONE — final chroni referencję, nie zawartość obiektu!
// list = new ArrayList<>();   // BŁĄD KOMPILACJI — nie można zmienić referencji
\`\`\`

### Rzutowanie typów (Type Casting):
* **Rzutowanie poszerzające (Widening)**: Automatyczne, bezstratne — np. \`int\` → \`long\` → \`double\`.
* **Rzutowanie zawężające (Narrowing)**: Wymaga jawnego rzutowania, może powodować utratę danych.

\`\`\`java
int i = 42;
double d = i;            // Widening: automatyczne (42.0)
int j = (int) 3.99;      // Narrowing: jawne — obcina część ułamkową (3)

Object obj = "Hello";
String s = (String) obj;  // Rzutowanie referencyjne (wymaga instanceof dla bezpieczeństwa)
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Który element ekosystemu Java jest bezpośrednio odpowiedzialny za kompilację kodu źródłowego .java do kodu bajtowego .class?",
      options: [
        "JVM (Java Virtual Machine)",
        "JRE (Java Runtime Environment)",
        "Kompilator javac wchodzący w skład JDK",
        "Garbage Collector"
      ],
      answer: 2,
      explanation: "Kompilator 'javac' przetwarza kod źródłowy na kod bajtowy. JVM wykonuje ten kod bajtowy, a JRE to środowisko uruchomieniowe bez narzędzi kompilacji."
    },
    {
      question: "Co to jest kompilacja JIT (Just-In-Time) w maszynie JVM?",
      options: [
        "Kompilacja całego projektu przed uruchomieniem w celu szybszego startu.",
        "Dynamiczna kompilacja często wykonywanych fragmentów kodu bajtowego do natywnego kodu maszynowego w trakcie działania programu.",
        "Usuwanie nieużywanych obiektów z pamięci sterty.",
        "Weryfikacja bezpieczeństwa kodu bajtowego przed uruchomieniem."
      ],
      answer: 1,
      explanation: "Kompilacja JIT (Just-In-Time) kompiluje kod bajtowy do kodu maszynowego na bieżąco podczas wykonywania programu, co drasticznie zwiększa wydajność."
    },
    {
      question: "Czym różnią się typy proste (np. int) od typów referencyjnych (np. Integer) w Javie?",
      options: [
        "Typy proste są zapisywane w plikach XML, a referencyjne w bazie danych.",
        "Zmienne typów prostych przechowują referencje, a typów referencyjnych bezpośrednie dane na stosie.",
        "Zmienne lokalne typów prostych przechowują wartości bezpośrednio (najczęściej na stosie), a typy referencyjne przechowują adresy do obiektów alokowanych na stercie.",
        "W Javie nie ma różnicy między typami prostymi a referencyjnymi."
      ],
      answer: 2,
      explanation: "Zmienne lokalne typów prostych przechowują wartości bezpośrednio (najczęściej na stosie), natomiast typy referencyjne wskazują na obiekty na stercie i domyślnie mogą przyjmować wartość null. Pola typów prostych w obiektach znajdują się na stercie razem z obiektem."
    }
  ]
};
