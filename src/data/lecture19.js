export const lecture19 = {
  id: "19",
  title: "Wykład 19: Narzędzia Backendowe - Logowanie (SLF4J) i Mockowanie (Mockito)",
  description: "Zastąpienie System.out.println profesjonalnym logowaniem oraz wprowadzenie do zaawansowanego testowania z użyciem biblioteki Mockito.",
  sections: [
    {
      title: "1. Dlaczego nie używamy System.out.println?",
      content: `
Kiedy uczymy się Javy, do sprawdzania wartości używamy \`System.out.println()\`. W komercyjnych aplikacjach backendowych jest to **surowo wzbronione** (tzw. "code smell").

Dlaczego?
1. **Brak konfiguracji:** Nie da się wyłączyć \`println\` na produkcji, nie da się też włączyć szczegółowego wypisywania (debugowania) bez rekompilacji kodu.
2. **Brak kontekstu:** \`println\` wypisuje sam tekst. Nie wiemy, o której godzinie to się stało, w jakim wątku (Thread), ani w jakiej klasie.
3. **Zablokowanie (I/O Blocking):** \`System.out.println\` jest operacją synchroniczną, która uderza bezpośrednio w strumień systemu operacyjnego. W aplikacji o dużym ruchu może to drastycznie spowolnić serwer.

Rozwiązaniem są **Logging Frameworks** (Frameworki do logowania).
`
    },
    {
      title: "2. SLF4J oraz Logback",
      content: `
W ekosystemie Javy standardem jest **SLF4J (Simple Logging Facade for Java)**. Jest to tylko *Fasada* (interfejs). Oznacza to, że Twój kod zależy tylko od SLF4J, a pod spodem możesz podpiąć dowolną implementację (np. Logback lub Log4j2). Spring Boot domyślnie używa połączenia SLF4J + Logback.

### Poziomy Logowania (Log Levels)
Każdy log ma swój priorytet. W konfiguracji możemy ustalić, że na produkcji wyświetlamy tylko INFO i wyżej, a na środowisku deweloperskim wszystkie poziomy.
1. \`TRACE\` - Najbardziej szczegółowe, śledzenie każdego kroku.
2. \`DEBUG\` - Informacje przydatne dla programistów do szukania błędów.
3. \`INFO\` - Standardowe informacje o działaniu aplikacji (np. "Serwer wystartował", "Użytkownik X się zalogował").
4. \`WARN\` - Ostrzeżenia, coś jest nie tak, ale aplikacja działa dalej (np. "Brakujące pole opcjonalne").
5. \`ERROR\` - Błąd krytyczny, wyjątek, aplikacja (lub dany proces) nie może kontynuować.

### Jak to wygląda w kodzie?
\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    // Tworzenie instancji loggera dla danej klasy
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public void registerUser(String username) {
        log.info("Rozpoczeto rejestracje uzytkownika: {}", username);
        
        try {
            // logika rejestracji
            log.debug("Wygenerowano token dla {}", username);
        } catch (Exception e) {
            // W przypadku ERROR przekazujemy treść oraz sam obiekt wyjątku 'e',
            // aby logger wydrukował tzw. StackTrace (ścieżkę błędu).
            log.error("Nie udalo sie zarejestrowac uzytkownika {}", username, e);
        }
    }
}
\`\`\`
Ważne: W logach używamy nawiasów klamrowych \`{}\` jako placeholderów. Logger podmieni je na zmienne. Jest to o wiele szybsze niż łączenie stringów (\`"Tekst " + var\`), ponieważ ewaluacja tekstu następuje *tylko* jeśli dany poziom logowania jest aktualnie włączony.
`
    },
    {
      title: "3. Mockito – Testowanie w izolacji",
      content: `
W Wykładzie 11 uczyliśmy się pisać testy jednostkowe w JUnit 5. Testowaliśmy wtedy metody niezależne. 
Co jednak, gdy chcemy przetestować \`UserService\`, który w swojej metodzie używa \`EmailSender\` oraz \`UserRepository\` (który łączy się z prawdziwą bazą danych)?

Test jednostkowy (Unit Test) z definicji **nie może** łączyć się z zewnętrznymi systemami (bazą, siecią). Jeśli by to robił, byłby to Test Integracyjny (Integration Test).

Aby przetestować sam \`UserService\`, musimy "udawać" działanie bazy danych i serwera email. Do tego służy najpopularniejsza w Javie biblioteka: **Mockito**.

### Czym jest Mock?
**Mock** to fałszywy obiekt. Posiada on wszystkie metody oryginału, ale domyślnie nic nie robią (zwracają null/0). Programista ustala zachowanie mocka (tzw. **Stubbing**), mówiąc: *"Kiedy ktoś wywoła metodę X, zwróć wartość Y"*.

### Przykład z Mockito (wymaga adnotacji @ExtendWith(MockitoExtension.class)):
\`\`\`java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    // 1. Tworzymy całkowicie fałszywy obiekt (zamiast prawdziwej bazy!)
    @Mock
    private UserRepository userRepository;

    // 2. Mockito stworzy UserService i automatycznie wstrzyknie do niego fałszywe repozytorium
    @InjectMocks
    private UserService userService;

    @Test
    void shouldFindUserWhenExists() {
        // GIVEN: Konfiguracja MOCKA (Stubbing)
        User fakeUser = new User(1L, "admin");
        
        // "Kiedy userRepository.findById(1L) zostanie wywołane, zwróć fakeUser"
        when(userRepository.findById(1L)).thenReturn(Optional.of(fakeUser));

        // WHEN: Wykonujemy rzeczywistą metodę serwisu
        User result = userService.getUserById(1L);

        // THEN: Sprawdzamy wyniki
        assertEquals("admin", result.getName());
        
        // Opcjonalnie: Możemy sprawdzić, czy metoda w ogóle została wywołana (Weryfikacja)
        verify(userRepository, times(1)).findById(1L);
    }
}
\`\`\`
Dzięki Mockito, nasz test wykona się w 0.001 sekundy bez żadnego połączenia z siecią, idealnie izolując logikę \`UserService\`!
`
    }
  ],
  quiz: [
    {
      question: "Z jakiego powodu zapis log.info(\"Wartosc: {}\", val) jest technicznie i wydajnościowo lepszy od log.info(\"Wartosc: \" + val)?",
      options: [
        "Stringi łączone plusem omijają blok try-catch i rzucają wyjątki bez StackTrace.",
        "Plus ('+') nie wspiera wypisywania liczb całkowitych w logach.",
        "Placeholder '{}' gwarantuje, że skomplikowana metoda .toString() na obiekcie 'val' i konkatenacja łańcuchów zostaną wykonane TYLKO WTEDY, gdy poziom INFO jest aktualnie włączony w systemie. Unika to marnowania mocy procesora.",
        "Oba zapisy działają dokładnie tak samo, to tylko kwestia konwencji."
      ],
      answer: 2,
      explanation: "Jeśli w środowisku włączymy tylko logi ERROR, wywołanie metody z '{}' nie połączy tych stringów w pamięci. Zapis z '+' sklei je w pamięci, by przekazać jako argument, tylko po to, by metoda ostatecznie odrzuciła ten tekst."
    },
    {
      question: "Co robi adnotacja @InjectMocks w teście biblioteki Mockito?",
      options: [
        "Łączy się z prawdziwą bazą danych, aby zasilić ją danymi z Mocka.",
        "Tworzy prawdziwą instancję testowanej klasy i próbuje wstrzyknąć do niej (np. przez konstruktor) wszystkie zdefiniowane wcześniej fałszywe obiekty oznaczone jako @Mock.",
        "Zastępuje wbudowany framework JUnit swoją własną maszyną wykonawczą.",
        "Automatycznie generuje dane testowe (stringi, inty) dla wszystkich pól w klasie."
      ],
      answer: 1,
      explanation: "@InjectMocks to automatyczny 'constructor injection'. Wywołuje 'new UserService(mockedRepo)', uwalniając nas z ręcznego tworzenia obiektu serwisowego."
    },
    {
      question: "Jaki poziom logowania powinieneś wybrać, aby zapisać informację o wyjątku bazy danych, z powodu którego aplikacja nie może zwrócić odpowiedzi klientowi?",
      options: [
        "DEBUG",
        "INFO",
        "WARN",
        "ERROR"
      ],
      answer: 3,
      explanation: "ERROR jest zarezerwowany dla zdarzeń krytycznych (wyjątków wpływających na przepływ, przerwanych transakcji). Błędy połączenia z bazą zdecydowanie kwalifikują się jako ERROR."
    }
  ]
};
