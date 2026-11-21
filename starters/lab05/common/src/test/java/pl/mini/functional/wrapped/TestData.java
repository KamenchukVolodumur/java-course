package pl.mini.functional.wrapped;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Builds Wrapped without the student's parse methods, so stages B2–B5 can be tested on their own. */
final class TestData {
    private TestData() { }

    static Map<String, Track> tracks(String csv) {
        Map<String, Track> result = new LinkedHashMap<>();
        for (String[] f : rows(csv)) {
            result.put(f[0], new Track(f[0], f[1], f[2], f[3], Integer.parseInt(f[4])));
        }
        return result;
    }

    static List<Play> plays(String csv) {
        List<Play> result = new ArrayList<>();
        for (String[] f : rows(csv)) {
            result.add(new Play(LocalDate.parse(f[0]), f[1], Integer.parseInt(f[2])));
        }
        return result;
    }

    static Wrapped sample() {
        return new Wrapped(tracks(Data.TRACKS), plays(Data.PLAYS));
    }

    private static List<String[]> rows(String csv) {
        List<String[]> rows = new ArrayList<>();
        List<String> lines = csv.lines().toList();
        for (int i = 1; i < lines.size(); i++) {
            if (!lines.get(i).isBlank()) rows.add(lines.get(i).split(";"));
        }
        return rows;
    }
}
