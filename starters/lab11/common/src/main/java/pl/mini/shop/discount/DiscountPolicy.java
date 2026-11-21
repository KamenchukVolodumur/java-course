package pl.mini.shop.discount;

import pl.mini.shop.model.Order;
import java.math.BigDecimal;

public interface DiscountPolicy {
    String name();
    BigDecimal discount(Order order);      // >= 0, scale 2
}
