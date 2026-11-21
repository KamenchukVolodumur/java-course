package pl.mini.bank.repository;

public class DuplicateClientException extends DataAccessException {
    public DuplicateClientException(String message) { super(message); }
    public DuplicateClientException(String message, Throwable cause) { super(message, cause); }
}
