package pl.mini.bank.service;

import pl.mini.bank.domain.Client;
import pl.mini.bank.repository.ClientRepository;

import java.math.BigDecimal;

// STAGE 4
public class ClientService {

    public ClientService(ClientRepository repository) {
        throw new UnsupportedOperationException("TODO");
    }

    public Client register(String pesel, String fullName) {
        throw new UnsupportedOperationException("TODO");
    }

    public Client deposit(String pesel, BigDecimal amount) {
        throw new UnsupportedOperationException("TODO");
    }

    public void transfer(String from, String to, BigDecimal amount) {
        throw new UnsupportedOperationException("TODO");
    }

    public BigDecimal totalBalance() {
        throw new UnsupportedOperationException("TODO");
    }
}
