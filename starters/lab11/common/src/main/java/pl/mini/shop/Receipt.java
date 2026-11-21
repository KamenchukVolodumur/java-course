package pl.mini.shop;

import java.math.BigDecimal;

// STAGE 5
public record Receipt(String orderId, String customerName, String details, BigDecimal total) {

    @Override
    public String toString() {
        throw new UnsupportedOperationException("TODO");
    }
}
