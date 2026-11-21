package pl.mini.collections;

import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== STAGE 1 =====
        // RingBuffer<String> rb = new RingBuffer<>(3);
        // rb.add("a"); rb.add("b");
        // System.out.println(rb.size() + " " + rb.isFull());
        // rb.add("c"); rb.add("d");
        // System.out.println(rb.size() + " " + rb.isFull() + " " + rb.get(0));
        // StringBuilder order = new StringBuilder();
        // for (String x : rb) order.append(x).append(' ');
        // System.out.println(order.toString().trim());
        // try { rb.add(null); } catch (NullPointerException e) { System.out.println("OK: null"); }

        // ===== STAGE 2 =====
        // System.out.println(rb);
        // try { for (String x : rb) if (x.equals("c")) rb.add("e"); }
        // catch (ConcurrentModificationException e) { System.out.println("OK: CME"); }
        // System.out.println(rb);
        // Iterator<String> it = rb.iterator();
        // it.next();
        // try { it.remove(); } catch (UnsupportedOperationException e) { System.out.println("OK: remove"); }

        // ===== STAGE 3 =====
        // List<Integer> nums = List.of(3, 9, 2);
        // System.out.println(CollectionUtils.max(nums));
        // System.out.println(CollectionUtils.max(List.of("pear", "fig", "banana"),
        //         Comparator.comparing(String::length)));
        // List<Object> sink = new ArrayList<>();
        // CollectionUtils.copyInto(nums, sink);
        // CollectionUtils.copyInto(rb, sink);
        // System.out.println(sink);
        // System.out.println(CollectionUtils.filter(nums, n -> n > 2));
        // System.out.println(CollectionUtils.sum(List.of(1, 2.5, 3L)));
        // try { CollectionUtils.max(new ArrayList<Integer>()); }
        // catch (NoSuchElementException e) { System.out.println("OK: empty"); }

        // ===== STAGE 4 =====
        // MultiMap<String, Integer> mm = new MultiMap<>();
        // mm.put("a", 1); mm.put("b", 2); mm.put("a", 3);
        // System.out.println(mm.get("a") + " " + mm.get("zzz") + " " + mm.size());
        // mm.remove("a", 1); mm.remove("b", 2);
        // System.out.println(mm.keys() + " " + mm.size());
        // try { mm.get("a").add(7); }
        // catch (UnsupportedOperationException e) { System.out.println("OK: read-only"); }

        // ===== STAGE 5 =====
        // LruCache<String, Integer> cache = new LruCache<>(2);
        // cache.put("x", 1); cache.put("y", 2);
        // cache.get("x");
        // cache.put("z", 3);
        // System.out.println(cache.keySet());
        // WordIndex idx = new WordIndex("""
        //         To be, or
        //         not to be:
        //         that is the question""");
        // System.out.println(idx.top(2));
        // System.out.println(idx.linesOf("be") + " " + idx.linesOf("nope"));
    }
}
