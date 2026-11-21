package pl.mini.shop.events;

import pl.mini.shop.model.Order;
import java.math.BigDecimal;

public record OrderPlaced(String orderId, Order order, BigDecimal total) { }
