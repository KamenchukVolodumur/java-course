package pl.mini.functional;

import java.util.*;
import java.util.stream.DoubleStream;
import java.util.function.DoubleSupplier;

public class MainA {
    public static void main(String[] args) {
        // ===== STAGE A1 =====
        // BinaryTree<Integer> t = BinaryTree.of(5, 3, 8, 1, 4, 9);
        // List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
        // t.depthFirst((v, d) -> pre.add(v), (v, d) -> in.add(v), (v, d) -> post.add(v));
        // System.out.println(pre + " " + in + " " + post);
        // t.printInOrder();

        // ===== STAGE A2 =====
        // Map<String, Integer> m = new HashMap<>();
        // MapUtils.addOrUpdate(m, "a", 1, (k, old) -> old + 10);
        // MapUtils.addOrUpdate(m, "a", 1, (k, old) -> old + 10);
        // System.out.println(m);
        // System.out.println(MapUtils.countWords("To be or not to be, TO BE!"));

        // ===== STAGE A3 =====
        // List<Integer> xs = List.of(4, 1, 7, 3);
        // System.out.println(FunctionalUtils.reduce(xs, 0, Integer::sum));
        // System.out.println(FunctionalUtils.reduce(xs, (a, b) -> a * b));
        // System.out.println(FunctionalUtils.max(xs) + " " + FunctionalUtils.min(List.<Integer>of()));
        // System.out.println(FunctionalUtils.reduce(List.of("a", "b", "c"), "", String::concat));

        // ===== STAGE A4 =====
        // Random rng = new Random(42);
        // DoubleSupplier r = Factories.randomInRange(rng, -1, 1);
        // boolean inRange = DoubleStream.generate(r).limit(1000).allMatch(x -> x >= -1 && x < 1);
        // double pi = Factories.monteCarloPi(Factories.randomPoint(rng, -1, 1), 100_000);
        // System.out.println(inRange + " " + (Math.abs(pi - Math.PI) < 0.05));

        // ===== STAGE A5 =====
        // System.out.printf(Locale.ROOT, "%.6f %.6f %.6f%n",
        //         Numerics.sqrt(2), Numerics.cubeRoot(27), Numerics.solveCosEqualsX());
        // try { Numerics.newton(x -> x * x + 1, 0.0); }
        // catch (ArithmeticException e) { System.out.println("OK: " + e.getMessage()); }
    }
}
