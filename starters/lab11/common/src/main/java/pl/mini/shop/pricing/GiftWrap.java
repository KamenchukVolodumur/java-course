package pl.mini.shop.pricing;

import java.math.BigDecimal;

// STAGE 4
public record GiftWrap(Priced inner) implements Priced {

    @Override
    public BigDecimal price() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public String description() {
        throw new UnsupportedOperationException("TODO");
    }
}
