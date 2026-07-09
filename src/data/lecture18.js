export const lecture18 = {
  id: "18",
  title: "Wykład 18: Relacyjne Bazy Danych i Podstawy SQL w Javie (JDBC)",
  description: "Zrozumienie działania relacyjnych baz danych, wprowadzenie do podstawowych instrukcji języka SQL oraz omówienie sposobu łączenia się z bazą danych z poziomu kodu Javy poprzez JDBC.",
  sections: [
    {
      title: "1. Relacyjne Bazy Danych (RDBMS)",
      content: `
Gdy dane w aplikacji, takiej jak sklep internetowy czy portal społecznościowy, muszą przetrwać pomiędzy uruchomieniami programu, używamy tzw. trwałości danych (Persistance). Do tego celu powszechnie stosuje się **Relacyjne Bazy Danych**. Przykłady to **PostgreSQL**, **MySQL**, **Oracle** czy wbudowana baza **H2**.

### Koncepcje relacyjne:
1. **Tabela (Table):** Przypomina arkusz kalkulacyjny w Excelu. Służy do przechowywania określonego typu danych, np. \`Users\` lub \`Orders\`.
2. **Rekord/Wiersz (Row):** Pojedynczy "obiekt" z danymi, czyli np. jeden konkretny użytkownik. Odpowiada jednemu instancji klasy w Javie.
3. **Kolumna (Column):** Atrybut danych o określonym typie, np. \`first_name\` (typu tekstowego), \`age\` (typu całkowitego). Odpowiada polu w klasie Javy.
4. **Klucz główny (Primary Key - PK):** Unikalny identyfikator każdego rekordu. Żadne dwa rekordy nie mogą mieć tego samego PK. Najczęściej jest to rosnący numer (ID) typu \`BIGINT\` (w Javie jako \`Long\`).
5. **Klucz obcy (Foreign Key - FK):** Wskazuje na Klucz Główny w innej tabeli, tworząc w ten sposób *relację* pomiędzy tabelami. Np. wiersz w tabeli \`Orders\` posiada pole \`user_id\`, które prowadzi nas do informacji o właścicielu w tabeli \`Users\`.
`
    },
    {
      title: "2. Język SQL (Structured Query Language)",
      content: `
Bazy relacyjne nie rozumieją Javy. By z nimi "porozmawiać", wykorzystujemy uniwersalny język **SQL**.

Dzieli się on na podgrupy, a najczęstszą z nich jest **DML (Data Manipulation Language)**. Jego fundamentami jest tak zwany **CRUD** (Create, Read, Update, Delete):

### 1. Pobieranie danych (Read - SELECT)
Służy do wyszukiwania danych.
\`\`\`sql
-- Wyciągnij wszystkich użytkowników z tabeli users
SELECT * FROM users;

-- Zwróć tylko adresy email dla użytkowników, którzy mają więcej niż 18 lat
SELECT email FROM users WHERE age > 18;
\`\`\`

### 2. Tworzenie danych (Create - INSERT)
Służy do wstawiania nowych rekordów.
\`\`\`sql
-- ID często jest generowane autoamtycznie, więc pomijamy je na wejściu.
INSERT INTO users (first_name, last_name, age, email) 
VALUES ('Jan', 'Kowalski', 25, 'jan@example.com');
\`\`\`

### 3. Aktualizacja danych (Update - UPDATE)
> [!WARNING]
> Zawsze stosuj klauzulę \`WHERE\` przy operacji \`UPDATE\` lub \`DELETE\`. W przeciwnym razie modyfikacji ulegną WSZYSTKIE rekordy w tabeli!

\`\`\`sql
-- Zmień adres email tylko użytkownikowi o ID = 42
UPDATE users 
SET email = 'new_email@example.com' 
WHERE id = 42;
\`\`\`

### 4. Usuwanie danych (Delete - DELETE)
\`\`\`sql
-- Usunięcie rekordu. Uważaj na brak klauzuli WHERE!
DELETE FROM users WHERE id = 42;
\`\`\`

### Pobieranie z relacji (JOIN)
Pozwala "skleić" w zapytaniu dane z kilku powiązanych ze sobą tabel (używając klucza głównego i klucza obcego).
\`\`\`sql
-- Znajdź wszystkie zamówienia oraz imiona osób, które je złożyły
SELECT orders.order_number, users.first_name 
FROM orders
JOIN users ON orders.user_id = users.id;
\`\`\`
`
    },
    {
      title: "3. Łączenie Javy z Bazą (JDBC)",
      content: `
Aplikacja z zasady nie używa okienka tekstowego SQL. Jak z poziomu kodu Javy wstawiać obiekty do tabel? Służy do tego warstwa **JDBC (Java Database Connectivity)** wbudowana w bibliotekę Javy (w pakiecie \`java.sql\`).

Kroki w klasycznym podejściu (tzw. "Czysty JDBC"):

### Krok 1: Dodanie sterownika bazy danych
Ponieważ do każdej bazy mówi się nieco innym "dialektem", potrzebujesz tłumacza (tzw. Drivera). Dodaje się go z pliku JAR lub z Mavena:
\`\`\`xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.2</version>
</dependency>
\`\`\`

### Krok 2: Kod komunikacyjny:
\`\`\`java
import java.sql.*;

public class JdbcExample {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/my_database";
        String user = "db_user";
        String pass = "db_password";

        // Używamy try-with-resources dla połączeń sieciowych do bezpiecznego ich zamknięcia!
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             PreparedStatement statement = conn.prepareStatement("SELECT * FROM users WHERE age > ?")) {

             // Zabezpieczenie przed atakiem SQL Injection: podmieniamy znak zapytania
             statement.setInt(1, 18);

             try (ResultSet rs = statement.executeQuery()) {
                 while (rs.next()) {
                     System.out.println("Znalazłem Usera: " + rs.getString("first_name"));
                 }
             }
        } catch (SQLException e) {
             e.printStackTrace();
        }
    }
}
\`\`\`

> [!NOTE]
> Zauważ, że w czystym podejściu JDBC, zaledwie dla jednego zapytania musimy utworzyć Connection, Prepared Statement, bindować parametry, wykonać query, stworzyć ResultSet oraz zamknąć wszystkie powiązane z nimi zmienne na końcu. A wszystko to owinąć w try-catch. Jest to tzw. "Boilerplate code" (kod szablonowy). 
`
    },
    {
      title: "4. ORM (Object-Relational Mapping)",
      content: `
Ze względu na obszerność boilerplate kodu w natywnym JDBC, świat Javy rzadko używa go bezpośrednio do pisania aplikacji korporacyjnych. O wiele popularniejszym podejściem są narzędzia, które załatwiają za nas "czarną robotę". Są to narzędzia **ORM (Object-Relational Mapping)**. 

Standardem Javy w tej kategorii jest **JPA (Java Persistence API)**, a wiodącą biblioteką implementującą jest **Hibernate**.

Narzędzia typu Hibernate pozwalają w ogóle przestać pisać bazowy SQL! Wystarczy zadeklarować klasę używając adnotacji. Framework sam stworzy w tle kod JDBC oraz zapytania SQL po to, by tę klasę automatycznie zsynchronizować z relacyjną tabelą.

Przykładowy zarys tego, co cię czeka w świecie Hibernate i Spring Data (kolejny szczebel zaawansowania dla Spring Boota):

\`\`\`java
@Entity // Mówi bibliotece, że ta klasa to reprezentacja Tabeli SQL
@Table(name = "users")
public class User {

    @Id // Klucz główny
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    // Magia polega na tym, że zamiast pisać "SELECT * FROM users WHERE age > 18"
    // Spring zbuduje nam obiekt i da gotową, dającą się wywołać bezpośrednio z kodu listę!
}
\`\`\`
Mimo iż z reguły bazuje się dzisiaj na Hibernate i narzędziach ORM, **zrozumienie bazowych konstrukcji SQL (Join, Select, Indexy)** jest jedną z najcenniejszych wartości na rynku pracy. Działanie narzędzia Hibernate bez problemu zrozumiesz, mając za sobą doświadczenie z Adnotacjami i Reflection API omawianymi we wcześniejszych modułach tego kursu!
`
    }
  ],
  quiz: [
    {
      question: "W jakim celu stosuje się klauzulę WHERE przy instrukcjach typu UPDATE lub DELETE?",
      options: [
        "Służy wyłącznie celom logowania – bez WHERE zapytanie wcale się nie uruchomi.",
        "Dzięki niej zoptymalizujemy zapis pod względem zużytej pamięci serwera.",
        "Chroni to nas przed omyłkowym zaaplikowaniem tej operacji dla WSZYSTKICH wierszy występujących w tej konkretnej tabeli.",
        "Powyższe stwierdzenie o WHERE w UPDATE/DELETE nie jest prawdziwe — klauzuli WHERE używa się wyłącznie z instrukcją SELECT."
      ],
      answer: 2,
      explanation: "Działanie `UPDATE` oraz `DELETE` bez nałożonego uprzednio filtru modyfikuje globalnie od góry do dołu całą tabelę, prowadząc najczęściej do krytycznych błędów biznesowych i incydentów produkcji."
    },
    {
      question: "Czym jest 'Foreign Key' w relacyjnej bazie danych?",
      options: [
        "Bezpiecznym kluczem autoryzacyjnym, wysyłanym z Frontendu",
        "Wartością powiązującą pole w danej tabeli do Klucza Głównego innej tabeli (służącą nawiązaniu i weryfikacji relacji)",
        "Wyłącznie inną nazwą na klucz UUID generowany z systemu operacyjnego",
        "Dodatkową kopią zapasową hasła do tej konkretnej bazy z autoryzacji"
      ],
      answer: 1,
      explanation: "Foreign Key (Klucz obcy) to podstawa łączenia tabel – np. przechowując w tabeli 'Samochod' informację na temat tego, do kogo on należy (z wykorzystaniem pola 'id_wlasciciela' pochodzącego z tabeli 'Klient')."
    },
    {
      question: "Dlaczego technologia ORM (jak Hibernate) stała się preferowaną opcją względem natywnego (czystego) użycia JDBC w środowisku Javy?",
      options: [
        "Ponieważ Hibernate wykonuje zapytania kilkadziesiąt razy szybciej niż standardowe JDBC pod spodem.",
        "Jako jedyna potrafi zamknąć za dewelopera gniazda Socket do wybranego klastra bazodanowego.",
        "Automatycznie zwalnia zasoby deweloperów z pisania trywialnego, szablonowego (boilerplate) kodu i konwertowania obiektów SQL -> Java ręcznie z każdej z poszczególnych kolumn ResultSet.",
        "Ponieważ natywny JDBC został porzucony od wersji Java 8 i ma w sobie wiele luk zabezpieczeń."
      ],
      answer: 2,
      explanation: "ORM odciąża deweloperów z rutynowego pisania logiki typu pobieranie parametru rs.getString(\"age\"), bindowanie PreparedStatement itd. Pamiętaj jednak, że z technicznego punktu widzenia ORM w tle wykonuje mimo wszystko zapytania poprzez wbudowane pod spodem JDBC, więc natywne połączenie bywa szybsze!"
    }
  ]
};
