package pl.mini.functional;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import pl.mini.functional.Factories.Point;

import java.util.Iterator;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.DoubleSupplier;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

@Tag("A4")
class FactoriesTest {

    @Test
    void randomInRangeStaysInsideHalfOpenInterval() {
        DoubleSupplier r = Factories.randomInRange(new Random(1), -1, 1);
        for (int i = 0; i < 10_000; i++) {
            double x = r.getAsDouble();
            assertTrue(x >= -1 && x < 1, "out of range: " + x);
        }
    }

    @Test
    void randomInRangeRejectsEmptyInterval() {
        assertThrows(IllegalArgumentException.class, () -> Factories.randomInRange(new Random(), 1, 1));
        assertThrows(IllegalArgumentException.class, () -> Factories.randomInRange(new Random(), 2, 1));
    }

    @Test
    void randomPointRejectsEmptyInterval() {
        assertThrows(IllegalArgumentException.class, () -> Factories.randomPoint(new Random(), 3, 0));
    }

    @Test
    void randomPointCoordinatesAreInRange() {
        Supplier<Point> points = Factories.randomPoint(new Random(7), 10, 20);
        for (int i = 0; i < 1_000; i++) {
            Point p = points.get();
            assertTrue(p.x() >= 10 && p.x() < 20 && p.y() >= 10 && p.y() < 20, "out of range: " + p);
        }
    }

    @Test
    void monteCarloPiUsesTheGivenSourceOfPoints() {
        assertEquals(4.0, Factories.monteCarloPi(() -> new Point(0, 0), 100), 1e-12);
        assertEquals(0.0, Factories.monteCarloPi(() -> new Point(1, 1), 100), 1e-12);

        Iterator<Point> alternating = Stream.iterate(0, i -> i + 1)
                .map(i -> i % 2 == 0 ? new Point(0.5, 0.5) : new Point(-0.9, 0.9))
                .iterator();
        assertEquals(2.0, Factories.monteCarloPi(alternating::next, 1_000), 1e-12);
    }

    @Test
    void pointOnTheCircleCountsAsInside() {
        assertEquals(4.0, Factories.monteCarloPi(() -> new Point(1, 0), 10), 1e-12);
    }

    @Test
    void defaultNumberOfSamplesIs1024() {
        AtomicInteger calls = new AtomicInteger();
        Factories.monteCarloPi(() -> { calls.incrementAndGet(); return new Point(0, 0); });

        assertEquals(1024, calls.get());
    }

    @Test
    void monteCarloPiWithRandomPointsIsCloseToPi() {
        double pi = Factories.monteCarloPi(Factories.randomPoint(new Random(42), -1, 1), 200_000);
        assertEquals(Math.PI, pi, 0.05);
    }
}
