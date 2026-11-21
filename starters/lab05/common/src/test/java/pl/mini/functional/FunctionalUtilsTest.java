package pl.mini.functional;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@Tag("A3")
class FunctionalUtilsTest {

    private final List<Integer> xs = List.of(4, 1, 7, 3);

    @Test
    void reduceWithIdentityFoldsFromTheLeft() {
        assertEquals(15, FunctionalUtils.reduce(xs, 0, Integer::sum));
        assertEquals("abc", FunctionalUtils.reduce(List.of("a", "b", "c"), "", String::concat));
    }

    @Test
    void reduceWithIdentityOfEmptyCollectionReturnsIdentity() {
        assertEquals(42, FunctionalUtils.reduce(List.<Integer>of(), 42, Integer::sum));
    }

    @Test
    void reduceWithoutIdentityStartsFromTheFirstElement() {
        assertEquals(Optional.of(84), FunctionalUtils.reduce(xs, (a, b) -> a * b));
        assertEquals(Optional.of(4), FunctionalUtils.reduce(List.of(4), (a, b) -> a * b));
    }

    @Test
    void reduceWithoutIdentityOfEmptyCollectionIsEmpty() {
        assertEquals(Optional.empty(), FunctionalUtils.reduce(List.<Integer>of(), Integer::sum));
    }

    @Test
    void maxAndMin() {
        assertEquals(Optional.of(7), FunctionalUtils.max(xs));
        assertEquals(Optional.of(1), FunctionalUtils.min(xs));
        assertEquals(Optional.of("pear"), FunctionalUtils.max(List.of("apple", "pear", "fig")));
    }

    @Test
    void maxAndMinOfEmptyCollectionAreEmpty() {
        assertEquals(Optional.empty(), FunctionalUtils.max(List.<Integer>of()));
        assertEquals(Optional.empty(), FunctionalUtils.min(List.<Integer>of()));
    }
}
