export const lab04 = {
  id: "Lab04",
  title: "Лабораторна 4: Менеджер Контактів",
  description: "Колекції, Lambda-вирази, Stream API, Comparable/Comparator та обробка винятків на прикладі консольної міні-апки.",
  sections: [
    {
      title: "Опис завдання",
      content: `
У цій лабораторній роботі ви створите повноцінну консольну програму — **Менеджер Контактів**. Програма дозволить додавати, шукати, фільтрувати, сортувати та групувати контакти.

Ця лабораторна покриває матеріал **Лекцій 4 і 5**:
* Інтерфейси \`Comparable\` та \`Comparator\` (Лекція 4)
* Лямбда-вирази та функціональні інтерфейси (\`Predicate\`, \`Function\`, \`Consumer\`) (Лекція 4)
* Method References (Лекція 4)
* Java Collections Framework: \`List\`, \`Set\`, \`Map\` (Лекція 4–5)
* Stream API: \`filter\`, \`map\`, \`sorted\`, \`collect\` (Лекція 5)
* \`Collectors.groupingBy\`, \`Collectors.joining\` (Лекція 5)
* Checked та Unchecked Exceptions, створення власних винятків (Лекція 5)
`
    },
    {
      title: "Task 1: Модель даних (2 бали)",
      content: `
### 1.1. Клас \`Contact\`
Створіть клас \`Contact\` у пакеті \`org.example.contacts.model\` з наступними полями:

\`\`\`java
public class Contact implements Comparable<Contact> {
    private final String firstName;
    private final String lastName;
    private final String phone;
    private final String email;
    private final ContactGroup group;

    // Конструктор, гетери, toString()
}
\`\`\`

Зверніть увагу:
* Всі поля \`final\` — об'єкт **іммутабельний** (після створення не може бути змінений).
* Клас реалізує інтерфейс \`Comparable<Contact>\` — метод \`compareTo\` повинен сортувати контакти **за прізвищем**, а при однакових прізвищах — **за ім'ям**.

### 1.2. Enum \`ContactGroup\`
Створіть enum \`ContactGroup\` у тому ж пакеті:

\`\`\`java
public enum ContactGroup {
    FAMILY("Родина"),
    FRIENDS("Друзі"),
    WORK("Робота"),
    UNIVERSITY("Університет"),
    OTHER("Інше");

    private final String displayName;

    ContactGroup(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
\`\`\`

### 1.3. Власний виняток \`DuplicateContactException\`
Створіть клас \`DuplicateContactException\` у пакеті \`org.example.contacts.exception\`:

\`\`\`java
public class DuplicateContactException extends Exception {
    public DuplicateContactException(String message) {
        super(message);
    }
}
\`\`\`

Це **checked exception** (наслідує \`Exception\`). Він буде кидатися при спробі додати контакт з телефоном, який вже існує у базі.

> [!IMPORTANT]
> **Питання для роздумів:** Чому ми використали \`Exception\`, а не \`RuntimeException\`? Тому що дублікат контакту — це ситуація, яку програма **може і повинна** обробити (наприклад, вивести повідомлення користувачу), а не фатальна помилка. Checked exceptions змушують програміста явно обробляти такі випадки.
`
    },
    {
      title: "Task 2: Сервіс управління контактами (3 бали)",
      content: `
Створіть клас \`ContactService\` у пакеті \`org.example.contacts.service\`. Цей клас міститиме всю бізнес-логіку.

### Стартовий код (скелет класу):
\`\`\`java
package org.example.contacts.service;

import org.example.contacts.exception.DuplicateContactException;
import org.example.contacts.model.Contact;
import org.example.contacts.model.ContactGroup;

import java.util.*;
import java.util.stream.*;

public class ContactService {
    private final List<Contact> contacts = new ArrayList<>();

    /**
     * Додає контакт до списку.
     * @throws DuplicateContactException якщо контакт з таким номером вже існує.
     */
    public void addContact(Contact contact) throws DuplicateContactException {
        // TODO: Перевірити, чи не існує контакт з таким самим телефоном.
        //       Використайте stream() + anyMatch() з Predicate.
        //       Якщо існує — кинути DuplicateContactException.
        //       Інакше — додати до списку.
    }

    /**
     * Повертає всі контакти, відсортовані природнім порядком (Comparable).
     */
    public List<Contact> getAllSorted() {
        // TODO: Використайте stream() + sorted() + collect(Collectors.toList())
        return List.of();
    }

    /**
     * Шукає контакти за частковим збігом імені або прізвища (case-insensitive).
     */
    public List<Contact> searchByName(String query) {
        // TODO: Використайте stream() + filter() з лямбдою,
        //       яка перевіряє firstName і lastName через toLowerCase().contains()
        return List.of();
    }

    /**
     * Повертає контакти, відсортовані за переданим Comparator.
     * Наприклад: за email, за групою, або за ім'ям у зворотному порядку.
     */
    public List<Contact> getAllSortedBy(Comparator<Contact> comparator) {
        // TODO: Використайте stream() + sorted(comparator) + collect()
        return List.of();
    }

    /**
     * Групує контакти за їхньою групою (ContactGroup).
     * Повертає Map, де ключ — група, значення — список контактів.
     */
    public Map<ContactGroup, List<Contact>> groupByCategory() {
        // TODO: Використайте stream() + Collectors.groupingBy()
        //       з method reference Contact::getGroup
        return Map.of();
    }

    /**
     * Повертає кількість контактів у кожній групі.
     */
    public Map<ContactGroup, Long> countByCategory() {
        // TODO: Використайте Collectors.groupingBy() + Collectors.counting()
        return Map.of();
    }

    /**
     * Повертає всі унікальні email-адреси, зібрані в один рядок через кому.
     */
    public String getAllEmailsAsString() {
        // TODO: Використайте stream() + map(Contact::getEmail)
        //       + distinct() + Collectors.joining(", ")
        return "";
    }

    /**
     * Перевіряє, чи є в базі хоча б один контакт з вказаної групи.
     */
    public boolean hasContactsInGroup(ContactGroup group) {
        // TODO: Використайте stream() + anyMatch()
        return false;
    }

    /**
     * Повертає Optional з контактом, у якого найдовше прізвище.
     */
    public Optional<Contact> findWithLongestLastName() {
        // TODO: Використайте stream() + max() з Comparator.comparingInt(...)
        return Optional.empty();
    }
}
\`\`\`

### Що потрібно реалізувати:
Замініть кожен \`// TODO\` на робочу імплементацію з використанням **Stream API**, **лямбда-виразів** та **method references**.

> [!TIP]
> Намагайтеся використовувати **method references** (\`Contact::getEmail\`, \`String::toLowerCase\`) там, де це можливо, замість повних лямбда-виразів. Це робить код компактнішим і читабельнішим.
`
    },
    {
      title: "Task 3: Консольний інтерфейс (2 бали)",
      content: `
Створіть клас \`Main\` у пакеті \`org.example.contacts\` з інтерактивним меню:

\`\`\`java
public class Main {
    public static void main(String[] args) {
        ContactService service = new ContactService();
        Scanner scanner = new Scanner(System.in);

        // Наповнити початковими даними (seed)
        seedData(service);

        while (true) {
            System.out.println("\\n=== Менеджер Контактів ===");
            System.out.println("1. Показати всі контакти");
            System.out.println("2. Додати контакт");
            System.out.println("3. Пошук за ім'ям");
            System.out.println("4. Сортувати за...");
            System.out.println("5. Групувати за категорією");
            System.out.println("6. Статистика");
            System.out.println("0. Вихід");
            System.out.print("Ваш вибір: ");

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> showAll(service);
                case "2" -> addContact(service, scanner);
                case "3" -> search(service, scanner);
                case "4" -> sortMenu(service, scanner);
                case "5" -> groupByCategory(service);
                case "6" -> showStats(service);
                case "0" -> {
                    System.out.println("До побачення!");
                    return;
                }
                default -> System.out.println("Невідома команда.");
            }
        }
    }
}
\`\`\`

### Реалізація пунктів меню:

**Пункт 2 — Додати контакт.** Запитайте у користувача ім'я, прізвище, телефон, email та групу. Для вибору групи виведіть список із \`ContactGroup.values()\`. Оберніть виклик \`service.addContact()\` у блок \`try-catch (DuplicateContactException e)\`, щоб вивести зрозуміле повідомлення замість краху програми.

**Пункт 4 — Сортувати за...** Покажіть підменю:
\`\`\`
  a) За прізвищем (натуральний порядок — Comparable)
  b) За email
  c) За групою, потім за прізвищем
\`\`\`
Для варіанту *b* передайте \`Comparator.comparing(Contact::getEmail)\`.
Для варіанту *c* використайте ланцюговий компаратор:
\`\`\`java
Comparator.comparing(Contact::getGroup)
          .thenComparing(Contact::getLastName)
\`\`\`

**Пункт 5 — Групувати за категорією.** Викличте \`service.groupByCategory()\` і виведіть результат у форматі:
\`\`\`
--- Робота ---
  Петренко Олег — +380501234567
  Іванова Марія — +380671112233
--- Родина ---
  Каменчук Андрій — +380931234567
\`\`\`
Для форматування використайте \`forEach\` на \`Map\` з лямбдою.

**Пункт 6 — Статистика.** Виведіть:
* Загальну кількість контактів (\`contacts.size()\`).
* Кількість контактів у кожній групі (\`countByCategory()\`).
* Список усіх email через кому (\`getAllEmailsAsString()\`).
* Контакт з найдовшим прізвищем (\`findWithLongestLastName()\` — зверніть увагу, що повертається \`Optional\`, тому використайте \`ifPresentOrElse\`).

### Початкові дані (seed):
Створіть метод \`seedData\`, який додає 6–8 тестових контактів у різних групах, щоб не вводити їх вручну при кожному запуску:
\`\`\`java
private static void seedData(ContactService service) {
    try {
        service.addContact(new Contact("Олег", "Петренко", "+380501234567",
            "oleg@work.com", ContactGroup.WORK));
        service.addContact(new Contact("Марія", "Іванова", "+380671112233",
            "maria@gmail.com", ContactGroup.FRIENDS));
        service.addContact(new Contact("Андрій", "Каменчук", "+380931234567",
            "andrii@family.com", ContactGroup.FAMILY));
        service.addContact(new Contact("Катерина", "Бондаренко", "+380661234567",
            "katya@uni.edu", ContactGroup.UNIVERSITY));
        service.addContact(new Contact("Дмитро", "Шевченко", "+380991234567",
            "dmytro@work.com", ContactGroup.WORK));
        service.addContact(new Contact("Юлія", "Коваленко", "+380731234567",
            "yulia@gmail.com", ContactGroup.FRIENDS));
    } catch (DuplicateContactException e) {
        System.err.println("Помилка ініціалізації: " + e.getMessage());
    }
}
\`\`\`
`
    },
    {
      title: "Task 4: Додаткові завдання (3 бали)",
      content: `
### 4.1. Валідація вхідних даних (1 бал)
Створіть клас \`ContactValidator\` з методом:
\`\`\`java
public static void validate(String firstName, String lastName,
                             String phone, String email)
                             throws InvalidContactDataException { ... }
\`\`\`

Створіть новий **unchecked exception** \`InvalidContactDataException\` (наслідує \`RuntimeException\`). Метод повинен перевіряти:
* Ім'я та прізвище не можуть бути порожніми (\`isBlank()\`).
* Телефон повинен починатися з \`+\` і містити лише цифри (перевірте за допомогою \`String.matches("\\\\+\\\\d+")\`).
* Email повинен містити символ \`@\`.

> [!IMPORTANT]
> **Чому тут \`RuntimeException\`?** Тому що некоректні дані від користувача — це **помилка програмування** (або UI), яку не завжди є сенс обробляти через \`try-catch\`. Це ілюструє різницю між checked та unchecked exceptions з Лекції 5.

### 4.2. Функціональний фільтр (1 бал)
Додайте метод у \`ContactService\`, який приймає довільний фільтр як параметр:
\`\`\`java
public List<Contact> filterBy(Predicate<Contact> predicate) {
    return contacts.stream()
                   .filter(predicate)
                   .collect(Collectors.toList());
}
\`\`\`

Використайте його у \`Main\` для створення складних фільтрів:
\`\`\`java
// Знайти всіх з групи WORK, чий email містить "work"
Predicate<Contact> workFilter = c -> c.getGroup() == ContactGroup.WORK;
Predicate<Contact> emailFilter = c -> c.getEmail().contains("work");

// Комбінуємо предикати через .and()
List<Contact> result = service.filterBy(workFilter.and(emailFilter));
\`\`\`

### 4.3. Трансформація та експорт (1 бал)
Додайте метод, який перетворює список контактів у список рядків у форматі CSV:
\`\`\`java
public List<String> exportToCsv() {
    return contacts.stream()
        .sorted()
        .map(c -> String.join(",",
            c.getFirstName(),
            c.getLastName(),
            c.getPhone(),
            c.getEmail(),
            c.getGroup().name()))
        .collect(Collectors.toList());
}
\`\`\`

Додайте пункт меню "7. Експорт у CSV", який виведе результат у консоль (кожен рядок — один контакт). У наступних лабораторних ми навчимося записувати це у файл.
`
    },
    {
      title: "Структура проекту",
      content: `
Фінальна структура вашого проекту повинна мати вигляд:
\`\`\`
ContactManager/
├── pom.xml
└── src/
    ├── main/java/org/example/contacts/
    │   ├── Main.java
    │   ├── model/
    │   │   ├── Contact.java
    │   │   └── ContactGroup.java
    │   ├── service/
    │   │   └── ContactService.java
    │   └── exception/
    │       ├── DuplicateContactException.java
    │       └── InvalidContactDataException.java
    └── test/java/org/example/contacts/
        └── service/
            └── ContactServiceTest.java  (бонус)
\`\`\`

> [!TIP]
> **Бонусне завдання:** Напишіть 3–4 модульних тести для \`ContactService\` (з використанням JUnit 5, який ви вивчили у Лабораторній 2). Наприклад:
> * \`addContact_DuplicatePhone_ThrowsException\` — перевірка, що при додаванні дубліката кидається виняток (\`assertThrows\`).
> * \`searchByName_PartialMatch_ReturnsResults\` — перевірка пошуку.
> * \`groupByCategory_ReturnsCorrectGroups\` — перевірка групування.
`
    }
  ],
  quiz: [
    {
      question: "Чим відрізняється `Comparable` від `Comparator`?",
      options: [
        "Comparable визначає природній порядок сортування ВСЕРЕДИНІ самого класу (метод compareTo), а Comparator — це ЗОВНІШНІЙ об'єкт, який задає альтернативний порядок (метод compare)",
        "Comparable працює тільки зі String, а Comparator — з будь-яким типом",
        "Comparable — це клас, а Comparator — інтерфейс",
        "Різниці немає, це синоніми"
      ],
      answer: 0,
      explanation: "Comparable<T> реалізується самим класом і визначає його 'натуральний' порядок (наприклад, прізвище). Comparator<T> — це окремий об'єкт, який можна створити через лямбду для будь-якого альтернативного сортування (наприклад, за email чи за групою)."
    },
    {
      question: "Що робить метод `Collectors.groupingBy(Contact::getGroup)`?",
      options: [
        "Сортує контакти за групою",
        "Видаляє дублікати груп",
        "Створює Map<ContactGroup, List<Contact>>, де ключ — група, а значення — список контактів цієї групи",
        "Фільтрує контакти, залишаючи лише ті, що мають групу"
      ],
      answer: 2,
      explanation: "Collectors.groupingBy() — це термінальна операція Stream, яка розподіляє елементи по групах, створюючи Map. Method reference Contact::getGroup вказує, за яким полем групувати."
    },
    {
      question: "Що станеться, якщо не обробити DuplicateContactException (checked exception) у коді?",
      options: [
        "Програма скомпілюється, але впаде при запуску",
        "Код не скомпілюється — компілятор Java ВИМАГАЄ обробити checked exceptions через try-catch або throws",
        "Нічого, checked exceptions ігноруються автоматично",
        "Компілятор видасть попередження (warning), але код скомпілюється"
      ],
      answer: 1,
      explanation: "Це ключова відмінність checked exceptions від unchecked (RuntimeException). Компілятор Java змушує програміста явно вказати, що він обробляє цей виняток (try-catch) або передає його далі (throws у сигнатурі методу)."
    },
    {
      question: "Як правильно скомбінувати два предикати, щоб знайти контакти з групи WORK, чий email містить 'work'?",
      options: [
        "workFilter.and(emailFilter)",
        "workFilter + emailFilter",
        "Predicate.combine(workFilter, emailFilter)",
        "workFilter && emailFilter"
      ],
      answer: 0,
      explanation: "Інтерфейс Predicate<T> має default-методи and(), or(), negate(), які дозволяють комбінувати предикати в складні умови без написання нових лямбд."
    }
  ]
};
