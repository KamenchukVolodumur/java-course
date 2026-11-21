package pl.mini.functional.wrapped;

import java.util.Locale;
import java.util.Map;

public class MainB {
    public static void main(String[] args) {
        Wrapped w = new Wrapped(Wrapped.parseTracks(Data.TRACKS), Wrapped.parsePlays(Data.PLAYS));

        // ===== STAGE B1 =====
        // System.out.println("Відтворень: " + w.playCount());
        // System.out.printf(Locale.ROOT, "Хвилин: %.1f%n", w.totalMinutes());
        // System.out.println("Різних треків: " + w.distinctTracks());
        // System.out.println("Днів зі слуханням: " + w.listeningDays());

        // ===== STAGE B2 =====
        // w.topTracks(3).forEach(System.out::println);
        // w.topArtistsByMinutes().forEach((artist, min) ->
        //         System.out.printf(Locale.ROOT, "%s: %.1f хв%n", artist, min));

        // ===== STAGE B3 =====
        // System.out.println("Невідомих відтворень: " + w.unknownPlays());
        // w.genreShare().forEach(System.out::println);
        // Map<Boolean, Long> c = w.completion();
        // System.out.println("Дослухано: " + c.get(true) + ", пропущено: " + c.get(false));

        // ===== STAGE B4 =====
        // w.monthly().forEach(System.out::println);

        // ===== STAGE B5 =====
        // System.out.print(w.report(2025));
    }
}
