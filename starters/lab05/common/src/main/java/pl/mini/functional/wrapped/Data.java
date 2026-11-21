package pl.mini.functional.wrapped;

public final class Data {
    private Data() { }

    public static final String TRACKS = """
            id;title;artist;genre;durationSec
            T1;Sunrise;Aurora Lane;pop;200
            T2;Night Drive;Neon Fox;synthwave;240
            T3;Paper Boats;Aurora Lane;pop;180
            T4;Granite;Stone Echo;rock;300
            T5;Low Tide;Neon Fox;synthwave;210
            T6;Wildfire;Stone Echo;rock;260
            """;

    public static final String PLAYS = """
            date;trackId;secondsPlayed
            2025-01-03;T1;200
            2025-01-03;T2;240
            2025-01-04;T1;200
            2025-01-05;T4;150
            2025-01-20;T2;240
            2025-02-01;T3;180
            2025-02-02;T3;180
            2025-02-02;T5;210
            2025-02-03;T1;100
            2025-02-14;T6;260
            2025-03-01;T2;240
            2025-03-02;T2;240
            2025-03-03;T4;300
            2025-03-04;T9;120
            """;
}
