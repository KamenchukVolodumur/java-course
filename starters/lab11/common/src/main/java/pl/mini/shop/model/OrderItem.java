package pl.mini.shop.model;

import java.math.BigDecimal;

// STAGE 1
public record OrderItem(String name, BigDecimal price, int qty) {

    /** price * qty, scale 2 */
    public BigDecimal total() {
        throw new UnsupportedOperationException("TODO");
    }
}
