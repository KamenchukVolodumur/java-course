package pl.mini.functional.wrapped;

import java.util.List;
import java.util.Map;

/** Part B. Inside the methods of this class: only Stream API, no for/while loops. */
public class Wrapped {
    private final Map<String, Track> tracks;
    private final List<Play> plays;

    public Wrapped(Map<String, Track> tracks, List<Play> plays) {
        this.tracks = tracks;
        this.plays = plays;
    }

    // ===== STAGE B1 =====

    public static Map<String, Track> parseTracks(String csv) {
        throw new UnsupportedOperationException("TODO");
    }

    public static List<Play> parsePlays(String csv) {
        throw new UnsupportedOperationException("TODO");
    }

    public long playCount() {
        throw new UnsupportedOperationException("TODO");
    }

    public double totalMinutes() {
        throw new UnsupportedOperationException("TODO");
    }

    public long distinctTracks() {
        throw new UnsupportedOperationException("TODO");
    }

    public long listeningDays() {
        throw new UnsupportedOperationException("TODO");
    }

    // ===== STAGE B2 =====

    public List<String> topTracks(int n) {
        throw new UnsupportedOperationException("TODO");
    }

    public Map<String, Double> topArtistsByMinutes() {
        throw new UnsupportedOperationException("TODO");
    }

    // ===== STAGE B3 =====

    public long unknownPlays() {
        throw new UnsupportedOperationException("TODO");
    }

    public List<String> genreShare() {
        throw new UnsupportedOperationException("TODO");
    }

    public Map<Boolean, Long> completion() {
        throw new UnsupportedOperationException("TODO");
    }

    // ===== STAGE B4 =====

    public List<String> monthly() {
        throw new UnsupportedOperationException("TODO");
    }

    // ===== STAGE B5 =====

    public String report(int year) {
        throw new UnsupportedOperationException("TODO");
    }
}
