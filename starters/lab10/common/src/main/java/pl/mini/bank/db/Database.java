package pl.mini.bank.db;

import javax.sql.DataSource;

// STAGE 1
public final class Database {
    private Database() { }

    /** jdbc:h2:mem:<name>;DB_CLOSE_DELAY=-1, then runs /schema.sql from the classpath. */
    public static DataSource h2InMemory(String name) {
        throw new UnsupportedOperationException("TODO");
    }
}
