package pl.mini.functional;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.function.DoubleUnaryOperator;

import static org.junit.jupiter.api.Assertions.*;

@Tag("A5")
class NumericsMessageTest {

    @Test
    void zeroDerivativeMessage() {
        ArithmeticException e = assertThrows(ArithmeticException.class, () -> Numerics.newton(x -> x * x + 1, 0.0));
        assertEquals("похідна ≈ 0", e.getMessage());
    }

    @Test
    void noConvergenceMessage() {
        DoubleUnaryOperator df = x -> 1.0 / (3 * Math.cbrt(x) * Math.cbrt(x));
        ArithmeticException e = assertThrows(ArithmeticException.class,
                () -> Numerics.newton(Math::cbrt, df, 1.0, 1e-10, 50));
        assertEquals("немає збіжності", e.getMessage());
    }
}
