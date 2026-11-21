package pl.mini.bank.db;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@Tag("stage1")
class DatabaseTest {

    @Test
    void schemaIsCreated() throws Exception {
        DataSource ds = Database.h2InMemory("schema-" + UUID.randomUUID());
        try (Connection c = ds.getConnection();
             ResultSet rs = c.createStatement().executeQuery("SELECT COUNT(*) FROM clients")) {
            rs.next();
            assertThat(rs.getInt(1)).isZero();
        }
    }

    @Test
    void theSameNameGivesTheSameDatabase() throws Exception {
        String name = "shared-" + UUID.randomUUID();
        try (Connection c = Database.h2InMemory(name).getConnection()) {
            c.createStatement().execute("INSERT INTO clients(pesel, full_name, balance) VALUES ('44051401359', 'Jan', 1)");
        }
        try (Connection c = Database.h2InMemory(name).getConnection();
             ResultSet rs = c.createStatement().executeQuery("SELECT COUNT(*) FROM clients")) {
            rs.next();
            assertThat(rs.getInt(1)).isEqualTo(1);
        }
    }
}
