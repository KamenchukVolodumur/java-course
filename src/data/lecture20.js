export const lecture20 = {
  id: "20",
  title: "Wykład 20: Podstawy Konteneryzacji (Docker) dla Java Developera",
  description: "Zrozumienie, czym jest Docker, jak stworzyć obraz aplikacji w Javie i uruchomić ją razem z bazą danych przy użyciu Docker Compose.",
  sections: [
    {
      title: "1. Czym jest Docker i dlaczego zrewolucjonizował Backend?",
      content: `
Kiedyś proces wdrażania (Deployment) aplikacji wyglądał tak: programista kompilował plik \`.jar\`, wysyłał go adminowi, a admin ręcznie instalował Javę, konfigurował ścieżki i odpalał projekt na serwerze. Często kończyło się to słynnym stwierdzeniem: *"Ale u mnie na komputerze to działało!"* (tzw. "It works on my machine" problem).

**Docker** rozwiązuje to poprzez pakowanie aplikacji wraz z całym jej otoczeniem (zależnościami, systemem operacyjnym, a nawet wbudowaną Javą) w przenośny paczkę zwaną **Kontenerem**.

### Główne pojęcia:
1. **Dockerfile:** Skrypt (przepis), który mówi Dockerowi krok po kroku jak zainstalować system i aplikację.
2. **Obraz (Image):** Zamrożony, niezmienny szablon, wygenerowany z Dockerfile'a (np. "System Linux Alpine + Java 21 + nasza aplikacja").
3. **Kontener (Container):** Uruchomiona na żywo, odizolowana kopia Obrazu.
`
    },
    {
      title: "2. Piszemy Dockerfile dla aplikacji Java",
      content: `
Aby zapakować naszą skompilowaną aplikację do Dockera, musimy utworzyć plik o nazwie \`Dockerfile\` (bez żadnego rozszerzenia) w głównym katalogu projektu.

Najprostsza wersja wygląda tak:
\`\`\`dockerfile
# 1. Wybierz obraz bazowy z zainstalowanym środowiskiem wykonawczym (JRE) Java 21
FROM eclipse-temurin:21-jre-alpine

# 2. Skopiuj skompilowany plik JAR z Twojego komputera do wnętrza kontenera
# Zakładamy, że zbudowałeś wcześniej projekt komendą 'mvn clean package'
COPY target/my-app-1.0.0.jar /app.jar

# 3. Odblokuj port, na którym nasłuchuje Twoja aplikacja (np. Spring Boot to 8080)
EXPOSE 8080

# 4. Zdefiniuj komendę uruchomieniową (co ma się stać przy starcie kontenera)
ENTRYPOINT ["java", "-jar", "/app.jar"]
\`\`\`

Aby zbudować obraz na podstawie tego pliku, wykonujemy w terminalu:
\`\`\`bash
docker build -t my-java-app .
\`\`\`
A aby go uruchomić (mapując port komputera na port kontenera):
\`\`\`bash
docker run -p 8080:8080 my-java-app
\`\`\`
`
    },
    {
      title: "3. Multi-stage Build (Budowanie wieloetapowe)",
      content: `
Poprzedni przykład zakładał, że zbudowaliśmy \`.jar\` ręcznie za pomocą Mavena na naszym komputerze. W profesjonalnym środowisku CI/CD, to serwer sam musi pobrać kod i go skompilować. A jeśli na serwerze nie ma Mavena? 

Rozwiązaniem jest **Multi-stage Build**. W jednym pliku Dockerfile robimy dwa etapy: w pierwszym używamy "ciężkiego" obrazu z pełnym JDK i Mavenem do zbudowania kodu, a w drugim tylko "lekkiego" obrazu (JRE) do jego uruchomienia.

\`\`\`dockerfile
# ETAP 1: Budowanie (Build Stage)
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app
# Kopiujemy kod źródłowy z komputera do kontenera
COPY pom.xml .
COPY src ./src
# Budujemy paczkę JAR w izolacji
RUN mvn clean package -DskipTests

# ETAP 2: Uruchomienie (Run Stage)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Kopiujemy TYLKO skompilowany plik jar z ETAPU 1!
# Dzięki temu w docelowym kontenerze nie mamy kodu źródłowego ani narzędzia Maven (mniej megabajtów, większe bezpieczeństwo)
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`
`
    },
    {
      title: "4. Docker Compose (Baza danych w 5 sekund)",
      content: `
Kiedy pracujesz nad backendem, zazwyczaj potrzebujesz też bazy danych. Konfiguracja i instalacja MySQL lub PostgreSQL bezpośrednio w Windows/Mac to koszmar. 

Zamiast tego używamy **Docker Compose** – narzędzia, które pozwala uruchomić wiele powiązanych kontenerów za pomocą jednego polecenia. Konfigurację zapisujemy w pliku \`docker-compose.yml\`.

\`\`\`yaml
version: '3.8'

services:
  # To jest definicja naszej bazy danych
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_DB: course_database
    ports:
      - "5432:5432" # Umożliwia Twojemu IntelliJ połączenie z bazą
    volumes:
      # Wolumeny gwarantują, że dane nie znikną, gdy zamkniesz kontener
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

Teraz, w tym samym katalogu, wpisujesz w terminal:
\`\`\`bash
docker-compose up -d
\`\`\`
I po kilku sekundach masz gotową, pełnoprawną bazę PostgreSQL na własnym komputerze, bez żadnych instalacji. Twoja aplikacja Java połączy się z nią na adresie \`localhost:5432\`! To absolutny przełom w wygodzie pracy każdego dewelopera.
`
    }
  ],
  quiz: [
    {
      question: "Co daje zastosowanie 'Multi-stage build' (dwóch klauzul FROM) w Dockerfile'u dla aplikacji Javowej?",
      options: [
        "Uruchamia dwie instancje aplikacji równolegle, zwiększając wydajność.",
        "Pozwala skompilować kod źródłowy za pomocą pełnego obrazu JDK+Maven, a do końcowego, ostatecznego obrazu wkleić tylko wynikowy plik .jar na mały, lekki obraz (np. alpine-jre), oszczędzając miejsce i zwiększając bezpieczeństwo.",
        "Kompiluje program najpierw pod architekturę Windows, a następnie Linux.",
        "Tworzy obraz kompatybilny tylko z serwerami AWS."
      ],
      answer: 1,
      explanation: "Dzięki multi-stage build unikamy w końcowym obrazie (tym umieszczanym na produkcji) zbędnych narzędzi takich jak Maven, kompilator Javy (javac) oraz samego kodu źródłowego. Minimalizujemy rozmiar (np. z 500MB na 150MB) oraz luki w zabezpieczeniach."
    },
    {
      question: "Czym różni się Obraz (Image) Dockera od Kontenera (Container)?",
      options: [
        "Są to synonimy, w dokumentacji można ich używać naprzemiennie.",
        "Obraz to kod na GitHubie, a Kontener to skompilowany plik JAR.",
        "Obraz to niezmienny 'przepis' / szablon wybudowany z Dockerfile. Kontener to faktyczna, uruchomiona na żywo w pamięci RAM instancja tego obrazu.",
        "Obraz to struktura relacyjnej bazy danych, a Kontener to serwer Java."
      ],
      answer: 2,
      explanation: "Image (obraz) przypomina definicję Klasy (np. definicja przepisu ciasta). Container (kontener) przypomina Obiekt (faktycznie upieczone z tego przepisu ciasto). Z jednego obrazu możesz odpalić 100 kontenerów na raz."
    },
    {
      question: "Po co mapujemy porty w Dockerze (np. docker run -p 8080:8080)?",
      options: [
        "Aby powiedzieć Dockerowi, że obraz waży maksymalnie 8080 bajtów.",
        "Ponieważ kontener działa w kompletnej izolacji od systemu hosta. Musimy wyraźnie połączyć port 8080 naszego komputera z portem 8080 nasłuchującym wewnątrz wyizolowanego kontenera.",
        "Jest to hasło uwierzytelniające dla bazy danych wbudowanej w Docker.",
        "Aby Java mogła komunikować się z logami systemowymi."
      ],
      answer: 1,
      explanation: "Kontenery mają swoją wydzieloną, osobną sieć. Bez przekierowania (-p HOST:CONTAINER), próba wpisania w przeglądarce localhost:8080 po prostu odbiłaby się od zapory Dockera, ponieważ nic nie wychodzi na zewnątrz 'pudełka' automatycznie."
    }
  ]
};
