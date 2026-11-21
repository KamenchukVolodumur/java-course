package pl.mini.shop.pricing;

import java.math.BigDecimal;

public interface Priced {
    BigDecimal price();
    String description();
}
