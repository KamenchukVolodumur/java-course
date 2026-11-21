package pl.mini.functional.wrapped;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@Tag("B1")
class WrappedB1Test {

    @Test
    void parseTracksKeepsFileOrder() {
        Map<String, Track> tracks = Wrapped.parseTracks(Data.TRACKS);

        assertInstanceOf(LinkedHashMap.class, tracks);
        assertEquals(List.of("T1", "T2", "T3", "T4", "T5", "T6"), List.copyOf(tracks.keySet()));
        assertEquals(new Track("T4", "Granite", "Stone Echo", "rock", 300), tracks.get("T4"));
    }

    @Test
    void parsePlaysReadsAllRows() {
        List<Play> plays = Wrapped.parsePlays(Data.PLAYS);

        assertEquals(14, plays.size());
        assertEquals(new Play(LocalDate.of(2025, 1, 3), "T1", 200), plays.get(0));
        assertEquals(new Play(LocalDate.of(2025, 3, 4), "T9", 120), plays.get(13));
    }

    @Test
    void parsingSkipsBlankLines() {
        String csv = "date;trackId;secondsPlayed\n2025-01-01;T1;10\n\n   \n2025-01-02;T2;20\n";
        assertEquals(2, Wrapped.parsePlays(csv).size());
    }

    @Test
    void basicCounts() {
        Wrapped w = TestData.sample();

        assertEquals(14, w.playCount());
        assertEquals(2860 / 60.0, w.totalMinutes(), 1e-9);
        assertEquals(7, w.distinctTracks());
        assertEquals(12, w.listeningDays());
    }

    @Test
    void emptyHistory() {
        Wrapped w = new Wrapped(Map.of(), List.of());

        assertEquals(0, w.playCount());
        assertEquals(0.0, w.totalMinutes(), 1e-9);
        assertEquals(0, w.distinctTracks());
        assertEquals(0, w.listeningDays());
    }
}
