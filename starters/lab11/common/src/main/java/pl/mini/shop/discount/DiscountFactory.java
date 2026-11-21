package pl.mini.shop.discount;

import pl.mini.shop.model.Order;
import java.util.List;

// STAGE 2
public final class DiscountFactory {
    private DiscountFactory() { }

    public static List<DiscountPolicy> applicable(Order order) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Discount best(Order order) {
        throw new UnsupportedOperationException("TODO");
    }
}
