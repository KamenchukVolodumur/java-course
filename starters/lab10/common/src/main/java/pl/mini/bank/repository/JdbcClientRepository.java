package pl.mini.bank.repository;

import pl.mini.bank.domain.Client;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

// STAGE 2 and STAGE 3 (transfer)
public class JdbcClientRepository implements ClientRepository {

    public JdbcClientRepository(DataSource dataSource) {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public Client save(Client c) {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public Optional<Client> findByPesel(String pesel) {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public List<Client> findAll() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public boolean updateBalance(String pesel, BigDecimal newBalance) {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public void transfer(String fromPesel, String toPesel, BigDecimal amount) {
        throw new UnsupportedOperationException("TODO");
    }
}
