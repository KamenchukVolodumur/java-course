package pl.mini.bank.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import pl.mini.bank.domain.Client;
import pl.mini.bank.repository.ClientRepository;
import pl.mini.bank.repository.DuplicateClientException;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/** Checks the behaviour of ClientService on a simple in-memory fake (stage 4). Your own Mockito tests are stage 5. */
@Tag("stage4")
class ClientServiceSpecTest {

    /** A fake repository on a map. */
    static class InMemoryRepo implements ClientRepository {
        final Map<String, Client> byPesel = new LinkedHashMap<>();
        long nextId = 1;
        int saves;
        public Client save(Client c) {
            if (byPesel.containsKey(c.pesel())) throw new DuplicateClientException(c.pesel());
            saves++;
            Client s = new Client(nextId++, c.pesel(), c.fullName(), c.balance());
            byPesel.put(c.pesel(), s);
            return s;
        }
        public Optional<Client> findByPesel(String p) { return Optional.ofNullable(byPesel.get(p)); }
        public List<Client> findAll() { return List.copyOf(byPesel.values()); }
        public boolean updateBalance(String p, BigDecimal b) {
            Client c = byPesel.get(p);
            if (c == null) return false;
            byPesel.put(p, new Client(c.id(), p, c.fullName(), b));
            return true;
        }
        public void transfer(String from, String to, BigDecimal amount) {
            updateBalance(from, byPesel.get(from).balance().subtract(amount));
            updateBalance(to, byPesel.get(to).balance().add(amount));
        }
    }

    private InMemoryRepo repo;
    private ClientService service;

    @BeforeEach
    void setUp() {
        repo = new InMemoryRepo();
        service = new ClientService(repo);
    }

    @Test
    void registerNormalizesTheName() {
        Client c = service.register("44051401359", "  Jan   Kowalski ");
        assertThat(c.fullName()).isEqualTo("Jan Kowalski");
        assertThat(c.id()).isNotNull();
        assertThat(c.balance()).isEqualByComparingTo("0");
    }

    @Test
    void registerRejectsDuplicates() {
        service.register("44051401359", "Jan");
        assertThatThrownBy(() -> service.register("44051401359", "Other")).isInstanceOf(DuplicateClientException.class);
        assertThat(repo.saves).isEqualTo(1);
    }

    @Test
    void depositAddsMoney() {
        service.register("44051401359", "Jan");
        service.deposit("44051401359", new BigDecimal("10.50"));
        Client c = service.deposit("44051401359", new BigDecimal("4.50"));
        assertThat(c.balance()).isEqualByComparingTo("15.00");
    }

    @Test
    void depositMustBePositive() {
        service.register("44051401359", "Jan");
        assertThatThrownBy(() -> service.deposit("44051401359", BigDecimal.ZERO)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void transferAndTotal() {
        service.register("44051401359", "Jan");
        service.register("02070803628", "Anna");
        service.deposit("44051401359", new BigDecimal("100.00"));
        service.transfer("44051401359", "02070803628", new BigDecimal("30.00"));
        assertThat(repo.findByPesel("02070803628")).get().extracting(Client::balance)
                .satisfies(b -> assertThat(b).isEqualByComparingTo("30.00"));
        assertThat(service.totalBalance()).isEqualByComparingTo("100.00");
    }

    @Test
    void totalOfNoClientsIsZero() {
        assertThat(service.totalBalance()).isEqualByComparingTo("0");
    }
}
