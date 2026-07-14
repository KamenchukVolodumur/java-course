export const lab06 = {
  id: "Lab06",
  title: "Лабораторна 6: Система Плагінів",
  description: "Використання Reflection API, анотацій, Sealed Classes та патернів проектування для створення динамічної архітектури, що розширюється.",
  sections: [
    {
      title: "Опис завдання",
      content: `
> [!NOTE]
> **Рекомендовані лекції для цієї лаби:** Лекції 07, 08, 16

У цій лабораторній роботі ви побудуєте **Систему Плагінів (Plugin System)** — типову архітектуру для додатків, які дозволяють стороннім розробникам додавати свій функціонал (як у VS Code чи IntelliJ IDEA).

Замість того, щоб жорстко "зашивати" (hardcode) логіку в головний клас, ваша програма буде **динамічно шукати** класи-плагіни під час виконання (Runtime) за допомогою Рефлексії, перевіряти їх і запускати.

Ця лабораторна покриває матеріал:
* **Лекція 7:** Reflection API, створення власних анотацій.
* **Лекція 8:** Sealed Classes, Pattern Matching (\`switch\` з типами).
* **Лекція 16:** Патерни Strategy (Стратегія) та Factory (Фабрика).
`
    },
    {
      title: "Task 1: Контракт плагіна та Анотація (1 бал)",
      content: `
Щоб програма розуміла, які класи є плагінами, а які ні, нам потрібен маркер (анотація) та контракт (інтерфейс).

### 1. Створення власної анотації
Створіть анотацію \`@PluginInfo\` у пакеті \`org.example.plugins.api\`:
\`\`\`java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// TODO 1: Зробіть так, щоб анотація була доступна в Runtime (RetentionPolicy)
// TODO 2: Зробіть так, щоб анотацію можна було вішати тільки на Класи (ElementType)
public @interface PluginInfo {
    String name();
    String version() default "1.0.0";
    String author();
}
\`\`\`

### 2. Створення контракту (Sealed Interface)
Створіть інтерфейс \`PluginAction\`, який будуть реалізовувати всі плагіни. Зробимо його \`sealed\`, щоб контролювати, які типи плагінів взагалі існують у системі.

\`\`\`java
package org.example.plugins.api;

// TODO: Зробіть інтерфейс sealed. Він повинен дозволяти (permits) 
// тільки дві категорії плагінів: TextPlugin та MathPlugin
public interface PluginAction {
    String execute(String input);
}

// TODO: Створіть інтерфейси TextPlugin та MathPlugin, 
// які наслідують (extends) PluginAction. 
// Вони мають бути 'non-sealed', щоб сторонні розробники могли їх реалізовувати.
\`\`\`
`
    },
    {
      title: "Task 2: Розробка конкретных плагінів (1 бал)",
      content: `
Тепер, коли в нас є контракт (патерн **Strategy**), створіть кілька "сторонніх" плагінів у пакеті \`org.example.plugins.impl\`.

\`\`\`java
@PluginInfo(name = "UpperCase Converter", author = "System")
public class UpperCasePlugin implements TextPlugin {
    @Override
    public String execute(String input) {
        return input == null ? "" : input.toUpperCase();
    }
}
\`\`\`

Створіть ще два плагіни самостійно:
1. \`ReverseTextPlugin\` (реалізує \`TextPlugin\`) — перевертає текст задом наперед. (Обов'язково додайте \`@PluginInfo\`).
2. \`WordCountPlugin\` (реалізує \`MathPlugin\`) — рахує кількість слів у вхідному тексті і повертає число у вигляді рядка (наприклад, \`"5"\`).
`
    },
    {
      title: "Task 3: Динамічний завантажувач плагінів (Reflection) (2 бали)",
      content: `
Це найскладніша частина. Створіть клас \`PluginManager\` (патерн **Factory** / Registry), який через рефлексію "просканує" пакет і створить об'єкти плагінів.

*Примітка: У реальних проектах для сканування пакетів використовують бібліотеку \`Reflections\` або механізми Spring. Тут ми для спрощення передамо список класів вручну, але інстанціювати їх будемо рефлексією.*

\`\`\`java
import org.example.plugins.api.PluginAction;
import org.example.plugins.api.PluginInfo;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.List;

public class PluginManager {
    private final List<PluginAction> loadedPlugins = new ArrayList<>();

    // У реальному житті тут був би сканер файлової системи (.class файлів).
    // Ми передаємо масив класів для спрощення.
    public void loadPlugins(Class<?>... classes) {
        for (Class<?> clazz : classes) {
            try {
                // TODO 1: Перевірте, czy klasa posiada adnotację @PluginInfo.
                // Użyj clazz.isAnnotationPresent(...)
                
                // TODO 2: Перевірте, czy klasa implementuje interfejs PluginAction.
                // Użyj PluginAction.class.isAssignableFrom(clazz)

                if (/* warunki spelnione */) {
                    // TODO 3: Pobierz adnotację @PluginInfo, by wypisać w konsoli:
                    // "Ladowanie wtyczki: [Nazwa] v[Wersja] autorstwa [Autor]"
                    
                    // TODO 4: Za pomocą refleksji pobierz bezparametrowy konstruktor
                    // i stwórz nową instancję wtyczki (Constructor.newInstance()).
                    
                    // TODO 5: Rzutuj (cast) stworzony obiekt na PluginAction 
                    // i dodaj do listy loadedPlugins.
                } else {
                    System.err.println("Pominiecie klasy " + clazz.getSimpleName() + " - niepoprawna wtyczka.");
                }

            } catch (Exception e) {
                System.err.println("Blad ladowania wtyczki " + clazz.getName() + ": " + e.getMessage());
            }
        }
    }

    public List<PluginAction> getLoadedPlugins() {
        return loadedPlugins;
    }
}
\`\`\`
`
    },
    {
      title: "Task 4: Pattern Matching i Wykonanie (1 бал)",
      content: `
Створіть клас \`Main\`, який з'єднає все разом.

Ми використаємо новітню функцію **Pattern Matching for \`switch\`** (Java 21+), щоб по-різному обробляти математичні та текстові плагіни (адже ми закрили ієрархію через \`sealed interface\`).

\`\`\`java
public class Main {
    public static void main(String[] args) {
        PluginManager manager = new PluginManager();
        
        // "Rejestrujemy" klasy do przeskanowania
        manager.loadPlugins(
                UpperCasePlugin.class, 
                ReverseTextPlugin.class, 
                WordCountPlugin.class, 
                String.class // Ten nie ma adnotacji, powinien zostac pominiety!
        );

        String testText = "Witaj swiecie Java";
        System.out.println("\\n--- Uruchamianie wtyczek dla tekstu: '" + testText + "' ---");

        for (PluginAction plugin : manager.getLoadedPlugins()) {
            
            // TODO: Użyj Pattern Matching w instrukcji switch!
            // Zamiast if (plugin instanceof TextPlugin), użyj nowej składni:
            /*
            switch (plugin) {
                case TextPlugin tp -> {
                    System.out.println("[Tekst] Wynik: " + tp.execute(testText));
                }
                case MathPlugin mp -> {
                    System.out.println("[Matematyka] Wynik: " + mp.execute(testText));
                }
                // default nie jest potrzebny, bo interfejs jest SEALED! Kompilator to wie.
            }
            */
            
            // Pamiętaj, aby przed wywołaniem pobrać @PluginInfo, żeby wypisać nazwę wtyczki obok wyniku.
        }
    }
}
\`\`\`
`
    }
  ],
  quiz: [
    {
      question: "Co daje nam użycie interfejsu typu 'sealed' w kontekście instrukcji switch (od Java 21)?",
      options: [
        "Szybsze działanie programu dzięki ominięciu mechanizmu refleksji.",
        "Możliwość użycia switcha bez klauzuli 'default' (Exhaustiveness). Kompilator wie, że obsłużyliśmy wszystkie możliwe typy podrzędne.",
        "Pozwala na nadpisywanie metod finalnych w klasach dziedziczących.",
        "Blokuje możliwość wstrzyknięcia złośliwego kodu przez obcych programistów."
      ],
      answer: 1,
      explanation: "Kompilator sprawdza, czy 'switch' obejmuje wszystkie dozwolone w klauzuli 'permits' typy. Jeśli tak, 'default' jest zbędny, a kod jest w 100% bezpieczny i przewidywalny."
    },
    {
      question: "Jaki jest cel adnotacji '@Retention(RetentionPolicy.RUNTIME)' przy tworzeniu własnej adnotacji @PluginInfo?",
      options: [
        "Gwarantuje, że adnotacja zostanie zachowana w skompilowanym pliku .class i będzie dostępna do odczytu przez Reflection API podczas działania programu.",
        "Nakazuje środowisku uruchomieniowemu ignorowanie tej klasy przy Garbage Collection.",
        "Zabezpiecza kod przed atakami typu SQL Injection w czasie wykonywania.",
        "Służy wyłącznie jako dokumentacja dla innych programistów."
      ],
      answer: 0,
      explanation: "Domyślną polityką retencji w Javie jest CLASS (adnotacja znika po załadowaniu do pamięci). Aby użyć jej w refleksji (np. clazz.isAnnotationPresent()), musimy jawnie wskazać RUNTIME."
    },
    {
      question: "Z jakim wzorcem projektowym (Design Pattern) najbardziej kojarzy się interfejs 'PluginAction' posiadający jedną metodę 'execute', która ma różne zachowania w zależności od implementacji?",
      options: [
        "Singleton",
        "Factory Method",
        "Strategy (Strategia)",
        "Observer (Obserwator)"
      ],
      answer: 2,
      explanation: "Wzorzec Strategy polega na wydzieleniu algorytmu (zachowania) do oddzielnej klasy implementującej wspólny interfejs. Pozwala to na dynamiczną wymianę (lub uruchamianie wielu) zachowań w czasie wykonania programu."
    },
    {
      question: "Jakie wyjątki najczęściej rzuca Reflection API podczas próby utworzenia obiektu (np. clazz.getDeclaredConstructor().newInstance())?",
      options: [
        "NullPointerException oraz IOException",
        "InstantiationException, IllegalAccessException, InvocationTargetException, NoSuchMethodException",
        "ClassNotFoundException oraz OutOfMemoryError",
        "Reflekcja nie rzuca wyjątków Checked, tylko Unchecked (RuntimeException)"
      ],
      answer: 1,
      explanation: "Refleksja jest wysoce niestabilna. Może brakować konstruktora (NoSuchMethodException), może być prywatny (IllegalAccessException), klasa może być abstrakcyjna (InstantiationException) lub sam konstruktor wtyczki może rzucić wyjątek (InvocationTargetException)."
    }
  ]
};
