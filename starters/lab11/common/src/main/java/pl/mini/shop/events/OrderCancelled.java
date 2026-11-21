package pl.mini.shop.events;

import java.math.BigDecimal;

public record OrderCancelled(String orderId, BigDecimal total) { }
