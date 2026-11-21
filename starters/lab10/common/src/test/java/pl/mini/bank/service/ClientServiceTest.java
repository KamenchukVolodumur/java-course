package pl.mini.bank.service;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.mini.bank.domain.Client;
import pl.mini.bank.repository.ClientRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** STAGE 5: YOUR unit tests with Mockito. The first one is given in the task; write the rest. */
@Tag("stage5")
@ExtendWith(MockitoExtension.class)
class ClientServiceTest {
    @Mock ClientRepository repo;
    @InjectMocks ClientService service;
    @Captor ArgumentCaptor<Client> clientCaptor;

    @Test
    void registerSavesNormalizedName() {
        when(repo.findByPesel("44051401359")).thenReturn(Optional.empty());
        when(repo.save(any())).thenAnswer(inv -> {
            Client c = inv.getArgument(0);
            return new Client(1L, c.pesel(), c.fullName(), c.balance());
        });

        Client saved = service.register("44051401359", "  Jan   Kowalski ");

        verify(repo).save(clientCaptor.capture());
        assertThat(clientCaptor.getValue().fullName()).isEqualTo("Jan Kowalski");
        assertThat(saved.id()).isEqualTo(1L);
    }

    @Test
    void registerRejectsDuplicateWithoutSaving() {
        fail("TODO: findByPesel -> Optional.of(...); verify(repo, never()).save(any())");
    }

    @Test
    void transferRejectsNonPositiveAmountWithoutTouchingRepository() {
        fail("TODO: verifyNoInteractions(repo)");
    }

    @Test
    void totalBalanceSumsAllClients() {
        fail("TODO: when(repo.findAll()).thenReturn(List.of(...))");
    }

    @Test
    void depositPropagatesUnexpectedDataAccessError() {
        fail("TODO: thenThrow(new DataAccessException(...))");
    }
}
