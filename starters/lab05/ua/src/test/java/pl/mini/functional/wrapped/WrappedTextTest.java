package pl.mini.functional.wrapped;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WrappedTextTest {

    @Test
    @Tag("B4")
    void monthlyIsSortedByMonth() {
        assertEquals(List.of(
                "2025-01 | відтворень: 5 | улюблений: Neon Fox",
                "2025-02 | відтворень: 5 | улюблений: Aurora Lane",
                "2025-03 | відтворень: 3 | улюблений: Neon Fox"), TestData.sample().monthly());
    }

    @Test
    @Tag("B5")
    void reportMatchesExpectedOutput() {
        assertEquals("""
                ===== ПІДСУМОК 2025 =====
                Хвилин музики: 47.7
                Трек року: Night Drive — Neon Fox
                Виконавець року: Neon Fox
                Жанр року: pop
                Найдовша серія: 4 дн. (2025-03-01 – 2025-03-04)
                """, TestData.sample().report(2025));
    }

    @Test
    @Tag("B5")
    void longestStreakPrefersTheEarliestOnTie() {
        Wrapped w = new Wrapped(
                TestData.tracks("id;title;artist;genre;durationSec\nT1;A;B;pop;60\n"),
                TestData.plays("""
                        date;trackId;secondsPlayed
                        2025-05-10;T1;60
                        2025-05-11;T1;60
                        2025-01-01;T1;60
                        2025-01-02;T1;60
                        2025-01-02;T1;60
                        """));

        assertTrue(w.report(2025).contains("Найдовша серія: 2 дн. (2025-01-01 – 2025-01-02)\n"),
                w.report(2025));
    }
}
