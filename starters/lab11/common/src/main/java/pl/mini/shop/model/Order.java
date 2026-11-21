package pl.mini.shop.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

// STAGE 1
public final class Order {

    private Order() { }   // TODO: build the order from a Builder

    public static Builder builder() {
        throw new UnsupportedOperationException("TODO");
    }

    public Builder toBuilder() {
        throw new UnsupportedOperationException("TODO");
    }

    public Customer customer() {
        throw new UnsupportedOperationException("TODO");
    }

    public List<OrderItem> items() {
        throw new UnsupportedOperationException("TODO");
    }

    public String shippingAddress() {
        throw new UnsupportedOperationException("TODO");
    }

    public Optional<String> promoCode() {
        throw new UnsupportedOperationException("TODO");
    }

    public BigDecimal subtotal() {
        throw new UnsupportedOperationException("TODO");
    }

    public int itemCount() {
        throw new UnsupportedOperationException("TODO");
    }

    public static final class Builder {

        public Builder customer(Customer c) {
            throw new UnsupportedOperationException("TODO");
        }

        public Builder item(String name, String price, int qty) {
            throw new UnsupportedOperationException("TODO");
        }

        public Builder item(OrderItem item) {
            throw new UnsupportedOperationException("TODO");
        }

        public Builder clearItems() {
            throw new UnsupportedOperationException("TODO");
        }

        public Builder shipTo(String address) {
            throw new UnsupportedOperationException("TODO");
        }

        public Builder promoCode(String code) {
            throw new UnsupportedOperationException("TODO");
        }

        public Order build() {
            throw new UnsupportedOperationException("TODO");
        }
    }
}
