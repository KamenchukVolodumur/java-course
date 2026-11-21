package pl.mini.functional;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.*;

@Tag("A2")
class MapUtilsTest {

    @Test
    void addOrUpdatePutsAddValueWhenKeyIsMissing() {
        Map<String, Integer> m = new HashMap<>();
        Integer result = MapUtils.addOrUpdate(m, "a", 1, (k, old) -> old + 10);

        assertEquals(1, result);
        assertEquals(Map.of("a", 1), m);
    }

    @Test
    void addOrUpdateAppliesUpdateWhenKeyIsPresent() {
        Map<String, Integer> m = new HashMap<>(Map.of("a", 1));
        Integer result = MapUtils.addOrUpdate(m, "a", 1, (k, old) -> old + 10);

        assertEquals(11, result);
        assertEquals(Map.of("a", 11), m);
    }

    @Test
    void updateReceivesTheKey() {
        Map<String, String> m = new HashMap<>(Map.of("x", "old"));
        MapUtils.addOrUpdate(m, "x", "new", (k, old) -> k + ":" + old);

        assertEquals("x:old", m.get("x"));
    }

    @Test
    void countWordsIgnoresCaseAndPunctuationAndSortsKeys() {
        Map<String, Integer> counts = MapUtils.countWords("To be or not to be, TO BE!");

        assertInstanceOf(TreeMap.class, counts);
        assertEquals(List.of("be", "not", "or", "to"), List.copyOf(counts.keySet()));
        assertEquals(Map.of("be", 3, "not", 1, "or", 1, "to", 3), counts);
    }

    @Test
    void countWordsHandlesNonLatinLetters() {
        assertEquals(Map.of("привіт", 2, "світ", 1), MapUtils.countWords("Привіт, світ! привіт"));
    }

    @Test
    void countWordsOfBlankTextIsEmpty() {
        assertTrue(MapUtils.countWords("  ...  ").isEmpty());
    }
}
