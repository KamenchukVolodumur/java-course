package pl.mini.shop.pricing;

import java.math.BigDecimal;

// STAGE 4
public record Shipping(Priced inner, boolean express) implements Priced {

    @Override
    public BigDecimal price() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public String description() {
        throw new UnsupportedOperationException("TODO");
    }
}
