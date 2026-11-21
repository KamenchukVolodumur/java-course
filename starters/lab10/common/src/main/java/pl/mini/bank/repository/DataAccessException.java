package pl.mini.bank.repository;

/** An unchecked wrapper of SQLException: the service layer does not need to know about JDBC. */
public class DataAccessException extends RuntimeException {
    public DataAccessException(String message) { super(message); }
    public DataAccessException(String message, Throwable cause) { super(message, cause); }
}
