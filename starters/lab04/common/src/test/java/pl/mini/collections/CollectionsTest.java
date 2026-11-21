package pl.mini.collections;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class CollectionsTest {

    // ===== STAGE 1 =====

    @Test
    @Tag("stage1")
    void capacityMustBePositive() {
        assertThrows(IllegalArgumentException.class, () -> new RingBuffer<String>(0));
        assertThrows(IllegalArgumentException.class, () -> new RingBuffer<String>(-2));
    }

    @Test
    @Tag("stage1")
    void getChecksTheIndexAgainstSizeNotCapacity() {
        RingBuffer<Integer> rb = new RingBuffer<>(5);
        rb.add(1); rb.add(2);
        assertEquals(5, rb.capacity());
        assertEquals(2, rb.get(1));
        assertThrows(IndexOutOfBoundsException.class, () -> rb.get(2));
        assertThrows(IndexOutOfBoundsException.class, () -> rb.get(-1));
    }

    @Test
    @Tag("stage1")
    void wrapsAroundManyTimes() {
        RingBuffer<Integer> rb = new RingBuffer<>(3);
        for (int i = 1; i <= 10; i++) rb.add(i);
        assertEquals(List.of(8, 9, 10), List.of(rb.get(0), rb.get(1), rb.get(2)));
        List<Integer> seen = new ArrayList<>();
        rb.forEach(seen::add);
        assertEquals(List.of(8, 9, 10), seen);
    }

    @Test
    @Tag("stage1")
    void emptyBufferHasNoElements() {
        RingBuffer<String> rb = new RingBuffer<>(2);
        assertEquals(0, rb.size());
        assertFalse(rb.isFull());
        assertFalse(rb.iterator().hasNext());
    }

    // ===== STAGE 2 =====

    @Test
    @Tag("stage2")
    void nextAfterTheEndThrows() {
        RingBuffer<String> rb = new RingBuffer<>(2);
        rb.add("x");
        Iterator<String> it = rb.iterator();
        it.next();
        assertThrows(NoSuchElementException.class, it::next);
    }

    @Test
    @Tag("stage2")
    void addAfterCreatingIteratorIsDetected() {
        RingBuffer<String> rb = new RingBuffer<>(2);
        rb.add("x");
        Iterator<String> it = rb.iterator();
        rb.add("y");
        assertThrows(ConcurrentModificationException.class, it::next);
    }

    @Test
    @Tag("stage2")
    void toStringOfEmptyBuffer() {
        assertEquals("[]", new RingBuffer<String>(3).toString());
    }

    // ===== STAGE 3 =====

    @Test
    @Tag("stage3")
    void maxReturnsTheFirstOfEqualElements() {
        String first = new String("bb"), second = new String("bb");
        assertSame(first, CollectionUtils.max(List.of("a", first, second)));
        assertEquals("pear", CollectionUtils.max(List.of("pear", "plum", "fig"), Comparator.comparing(String::length)));
    }

    @Test
    @Tag("stage3")
    void maxWithComparatorOfEmptyCollectionThrows() {
        assertThrows(NoSuchElementException.class,
                () -> CollectionUtils.max(List.<String>of(), Comparator.naturalOrder()));
    }

    @Test
    @Tag("stage3")
    void filterReturnsNewModifiableListAndKeepsInput() {
        List<Integer> src = new ArrayList<>(List.of(1, 2, 3, 4));
        List<Integer> even = CollectionUtils.filter(src, n -> n % 2 == 0);
        even.add(100);
        assertEquals(List.of(1, 2, 3, 4), src);
        assertEquals(List.of(2, 4, 100), even);
    }

    @Test
    @Tag("stage3")
    void sumOfEmptyIsZero() {
        assertEquals(0.0, CollectionUtils.sum(List.<Integer>of()));
    }

    // ===== STAGE 4 =====

    @Test
    @Tag("stage4")
    void removeReturnsFalseForMissingPair() {
        MultiMap<String, Integer> mm = new MultiMap<>();
        mm.put("a", 1);
        assertFalse(mm.remove("a", 2));
        assertFalse(mm.remove("zzz", 1));
        assertEquals(1, mm.size());
    }

    @Test
    @Tag("stage4")
    void removeTakesOneOccurrenceAndDropsEmptyKeys() {
        MultiMap<String, Integer> mm = new MultiMap<>();
        mm.put("a", 1); mm.put("a", 1); mm.put("b", 2);
        assertTrue(mm.remove("a", 1));
        assertEquals(List.of(1), mm.get("a"));
        assertTrue(mm.remove("a", 1));
        assertEquals(List.of("b"), List.copyOf(mm.keys()));
        assertEquals(1, mm.size());
    }

    @Test
    @Tag("stage4")
    void keysKeepInsertionOrder() {
        MultiMap<String, Integer> mm = new MultiMap<>();
        for (String k : List.of("z", "a", "m", "a")) mm.put(k, 0);
        assertEquals(List.of("z", "a", "m"), List.copyOf(mm.keys()));
    }

    @Test
    @Tag("stage4")
    void getIsAViewNotACopy() {
        MultiMap<String, Integer> mm = new MultiMap<>();
        mm.put("a", 1);
        List<Integer> view = mm.get("a");
        mm.put("a", 2);
        assertEquals(List.of(1, 2), view);
    }

    // ===== STAGE 5 =====

    @Test
    @Tag("stage5")
    void lruCapacityMustBePositive() {
        assertThrows(IllegalArgumentException.class, () -> new LruCache<String, Integer>(0));
    }

    @Test
    @Tag("stage5")
    void lruEvictsTheLeastRecentlyUsed() {
        LruCache<Integer, String> cache = new LruCache<>(3);
        for (int i = 1; i <= 3; i++) cache.put(i, "v" + i);
        cache.get(1);
        cache.put(4, "v4");
        assertEquals(List.of(3, 1, 4), List.copyOf(cache.keySet()));
    }

    @Test
    @Tag("stage5")
    void wordIndexIsCaseInsensitiveAndBreaksTiesAlphabetically() {
        WordIndex idx = new WordIndex("B a\nb A c\nC");
        assertEquals(List.of(Map.entry("a", 2), Map.entry("b", 2), Map.entry("c", 2)), idx.top(3));
        assertEquals(List.of(2, 3), idx.linesOf("c"));
    }
}
