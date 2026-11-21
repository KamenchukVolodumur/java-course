package pl.mini.exchange;

public record Trade(long buyId, long sellId, long price, int qty) { }
