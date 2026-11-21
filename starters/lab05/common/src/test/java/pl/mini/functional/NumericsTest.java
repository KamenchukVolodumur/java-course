package pl.mini.functional;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.function.DoubleUnaryOperator;

import static org.junit.jupiter.api.Assertions.*;

@Tag("A5")
class NumericsTest {

    @Test
    void derivativeIsCentralDifference() {
        DoubleUnaryOperator d = Numerics.derivative(x -> x * x, 1e-5);
        assertEquals(6.0, d.applyAsDouble(3.0), 1e-6);

        DoubleUnaryOperator coarse = Numerics.derivative(x -> x * x * x, 0.5);
        assertEquals((8.0 - 1.0) / 1.0, coarse.applyAsDouble(1.5), 1e-12);   // (f(2) − f(1)) / (2·0.5)
    }

    @Test
    void newtonWithExplicitDerivativeFindsRoot() {
        double root = Numerics.newton(x -> x * x - 9, x -> 2 * x, 1.0, 1e-12, 100);
        assertEquals(3.0, root, 1e-9);
    }

    @Test
    void newtonThrowsWhenItDoesNotConverge() {
        // for f(x) = cbrt(x) every step doubles the distance from the root
        DoubleUnaryOperator f = Math::cbrt;
        DoubleUnaryOperator df = x -> 1.0 / (3 * Math.cbrt(x) * Math.cbrt(x));
        assertThrows(ArithmeticException.class, () -> Numerics.newton(f, df, 1.0, 1e-10, 50));
    }

    @Test
    void newtonThrowsWhenDerivativeIsZero() {
        assertThrows(ArithmeticException.class, () -> Numerics.newton(x -> x * x + 1, 0.0));
    }

    @Test
    void sqrtCubeRootAndCosEqualsX() {
        assertEquals(Math.sqrt(2), Numerics.sqrt(2), 1e-9);
        assertEquals(3.0, Numerics.cubeRoot(27), 1e-9);
        assertEquals(0.7390851332, Numerics.solveCosEqualsX(), 1e-9);
    }

    @Test
    void cubeRootOfNegativeNumberWorks() {
        assertEquals(-2.0, Numerics.cubeRoot(-8), 1e-9);
    }

    @Test
    void sqrtOfNegativeNumberIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> Numerics.sqrt(-1));
    }
}
