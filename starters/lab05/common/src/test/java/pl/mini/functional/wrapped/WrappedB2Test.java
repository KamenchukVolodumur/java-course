package pl.mini.functional.wrapped;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@Tag("B2")
class WrappedB2Test {

    @Test
    void topTracksAreNumberedAndSortedByPlays() {
        assertEquals(List.of(
                "1. Night Drive — Neon Fox (4)",
                "2. Sunrise — Aurora Lane (3)",
                "3. Granite — Stone Echo (2)"), TestData.sample().topTracks(3));
    }

    @Test
    void topTracksBreaksTiesByTitle() {
        List<String> all = TestData.sample().topTracks(10);

        assertEquals(6, all.size(), "only known tracks that were played");
        assertEquals("3. Granite — Stone Echo (2)", all.get(2));
        assertEquals("4. Paper Boats — Aurora Lane (2)", all.get(3));
    }

    @Test
    void topArtistsByMinutesIsOrderedDescending() {
        Map<String, Double> top = TestData.sample().topArtistsByMinutes();

        assertEquals(List.of("Neon Fox", "Aurora Lane", "Stone Echo"), List.copyOf(top.keySet()));
        assertEquals(1170 / 60.0, top.get("Neon Fox"), 1e-9);
        assertEquals(860 / 60.0, top.get("Aurora Lane"), 1e-9);
        assertEquals(710 / 60.0, top.get("Stone Echo"), 1e-9);
    }
}
