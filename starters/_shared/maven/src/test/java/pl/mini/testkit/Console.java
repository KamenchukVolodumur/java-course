package pl.mini.testkit;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Helpers for tests that check what a piece of code prints. */
public final class Console {
    private Console() { }

    @FunctionalInterface
    public interface Code {
        void run() throws Exception;
    }

    /** Runs the code with System.out redirected and returns what it printed (line breaks normalized to \n). */
    public static String capture(Code code) {
        return captureWithInput("", code);
    }

    /** Same as {@link #capture}, with the given text on System.in. */
    public static String captureWithInput(String stdin, Code code) {
        PrintStream originalOut = System.out;
        InputStream originalIn = System.in;
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        System.setOut(new PrintStream(buffer, true, StandardCharsets.UTF_8));
        System.setIn(new ByteArrayInputStream(stdin.getBytes(StandardCharsets.UTF_8)));
        try {
            code.run();
        } catch (RuntimeException | Error e) {
            throw e;
        } catch (Exception e) {
            throw new AssertionError(e);
        } finally {
            System.setOut(originalOut);
            System.setIn(originalIn);
        }
        return buffer.toString(StandardCharsets.UTF_8).replace("\r\n", "\n");
    }

    /** Asserts that the code prints exactly the expected text. */
    public static void assertPrints(String expected, Code code) {
        assertEquals(expected, capture(code));
    }
}
