package pl.mini.shop;

import pl.mini.shop.model.Customer;
import pl.mini.shop.model.OrderItem;
import java.util.List;

public record OrderRequest(Customer customer, List<OrderItem> items, String address, String promoCode,
                           boolean giftWrap, boolean insurance, boolean express) { }
