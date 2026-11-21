package pl.mini.functional.wrapped;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@Tag("B3")
class WrappedB3Test {

    @Test
    void unknownPlaysAreCounted() {
        assertEquals(1, TestData.sample().unknownPlays());
    }

    @Test
    void genreShareUsesKnownPlaysOnly() {
        assertEquals(List.of(
                "pop: 5 (38.5%)",
                "synthwave: 5 (38.5%)",
                "rock: 3 (23.1%)"), TestData.sample().genreShare());
    }

    @Test
    void completionSplitsKnownPlays() {
        Map<Boolean, Long> c = TestData.sample().completion();

        assertEquals(11L, c.get(true));
        assertEquals(2L, c.get(false));
    }

    @Test
    void completionHasBothKeysEvenIfOneGroupIsEmpty() {
        Wrapped w = new Wrapped(
                TestData.tracks("id;title;artist;genre;durationSec\nT1;A;B;pop;100\n"),
                TestData.plays("date;trackId;secondsPlayed\n2025-01-01;T1;100\n"));
        Map<Boolean, Long> c = w.completion();

        assertEquals(1L, c.get(true));
        assertEquals(0L, c.get(false));
    }
}
