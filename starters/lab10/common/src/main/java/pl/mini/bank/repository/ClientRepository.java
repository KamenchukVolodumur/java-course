package pl.mini.bank.repository;

import pl.mini.bank.domain.Client;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ClientRepository {
    Client save(Client c);                      // INSERT; returns a copy with the id from the database
    Optional<Client> findByPesel(String pesel);
    List<Client> findAll();                     // by id ascending
    boolean updateBalance(String pesel, BigDecimal newBalance);   // false if there is no such client
    void transfer(String fromPesel, String toPesel, BigDecimal amount);   // stage 3
}
