package pl.mini.bank.config;

import java.util.Map;

// STAGE 1
public record AppConfig(String dbUrl, String dbUser, String dbPassword, int httpPort, int poolSize) {

    /** In main: AppConfig.fromEnv(System.getenv()). Reports ALL problems at once. */
    public static AppConfig fromEnv(Map<String, String> env) {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public String toString() {
        throw new UnsupportedOperationException("TODO");
    }
}
