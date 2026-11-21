package pl.mini.collections;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.*;

import static pl.mini.testkit.Console.assertPrints;

/** Runs the same code as the STAGE blocks in Main and compares the output with the task. */
class MainOutputTest {

    private static RingBuffer<String> afterStage1() {
        RingBuffer<String> rb = new RingBuffer<>(3);
        for (String s : List.of("a", "b", "c", "d")) rb.add(s);
        return rb;
    }

    @Test
    @Tag("stage1")
    void stage1() {
        assertPrints("""
                2 false
                3 true b
                b c d
                OK: null
                """, () -> {
            RingBuffer<String> rb = new RingBuffer<>(3);
            rb.add("a"); rb.add("b");
            System.out.println(rb.size() + " " + rb.isFull());
            rb.add("c"); rb.add("d");
            System.out.println(rb.size() + " " + rb.isFull() + " " + rb.get(0));
            StringBuilder order = new StringBuilder();
            for (String x : rb) order.append(x).append(' ');
            System.out.println(order.toString().trim());
            try { rb.add(null); } catch (NullPointerException e) { System.out.println("OK: null"); }
        });
    }

    @Test
    @Tag("stage2")
    void stage2() {
        assertPrints("""
                [b, c, d]
                OK: CME
                [c, d, e]
                OK: remove
                """, () -> {
            RingBuffer<String> rb = afterStage1();
            System.out.println(rb);
            try { for (String x : rb) if (x.equals("c")) rb.add("e"); }
            catch (ConcurrentModificationException e) { System.out.println("OK: CME"); }
            System.out.println(rb);
            Iterator<String> it = rb.iterator();
            it.next();
            try { it.remove(); } catch (UnsupportedOperationException e) { System.out.println("OK: remove"); }
        });
    }

    @Test
    @Tag("stage3")
    void stage3() {
        assertPrints("""
                9
                banana
                [3, 9, 2, c, d, e]
                [3, 9]
                6.5
                OK: empty
                """, () -> {
            RingBuffer<String> rb = afterStage1();
            rb.add("e");
            List<Integer> nums = List.of(3, 9, 2);
            System.out.println(CollectionUtils.max(nums));
            System.out.println(CollectionUtils.max(List.of("pear", "fig", "banana"),
                    Comparator.comparing(String::length)));
            List<Object> sink = new ArrayList<>();
            CollectionUtils.copyInto(nums, sink);
            CollectionUtils.copyInto(rb, sink);
            System.out.println(sink);
            System.out.println(CollectionUtils.filter(nums, n -> n > 2));
            System.out.println(CollectionUtils.sum(List.of(1, 2.5, 3L)));
            try { CollectionUtils.max(new ArrayList<Integer>()); }
            catch (NoSuchElementException e) { System.out.println("OK: empty"); }
        });
    }

    @Test
    @Tag("stage4")
    void stage4() {
        assertPrints("""
                [1, 3] [] 3
                [a] 1
                OK: read-only
                """, () -> {
            MultiMap<String, Integer> mm = new MultiMap<>();
            mm.put("a", 1); mm.put("b", 2); mm.put("a", 3);
            System.out.println(mm.get("a") + " " + mm.get("zzz") + " " + mm.size());
            mm.remove("a", 1); mm.remove("b", 2);
            System.out.println(mm.keys() + " " + mm.size());
            try { mm.get("a").add(7); }
            catch (UnsupportedOperationException e) { System.out.println("OK: read-only"); }
        });
    }

    @Test
    @Tag("stage5")
    void stage5() {
        assertPrints("""
                [x, z]
                [be=2, to=2]
                [1, 2] []
                """, () -> {
            LruCache<String, Integer> cache = new LruCache<>(2);
            cache.put("x", 1); cache.put("y", 2);
            cache.get("x");
            cache.put("z", 3);
            System.out.println(cache.keySet());
            WordIndex idx = new WordIndex("""
                    To be, or
                    not to be:
                    that is the question""");
            System.out.println(idx.top(2));
            System.out.println(idx.linesOf("be") + " " + idx.linesOf("nope"));
        });
    }
}
