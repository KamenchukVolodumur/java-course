package pl.mini.bank.repository;

public class NoSuchClientException extends DataAccessException {
    public NoSuchClientException(String message) { super(message); }
}
