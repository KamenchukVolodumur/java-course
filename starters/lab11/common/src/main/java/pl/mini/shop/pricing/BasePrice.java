package pl.mini.shop.pricing;

import pl.mini.shop.discount.Discount;
import pl.mini.shop.model.Order;
import java.math.BigDecimal;

// STAGE 4
public record BasePrice(Order order, Discount discount) implements Priced {

    @Override
    public BigDecimal price() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public String description() {
        throw new UnsupportedOperationException("TODO");
    }
}
