package pl.mini.functional.wrapped;

import java.time.LocalDate;

public record Play(LocalDate date, String trackId, int secondsPlayed) { }
