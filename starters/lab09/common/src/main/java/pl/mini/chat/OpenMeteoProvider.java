package pl.mini.chat;

import java.util.concurrent.CompletableFuture;

// STAGE 5: the real provider (not covered by the tests: it needs the internet)
public class OpenMeteoProvider implements WeatherProvider {

    @Override
    public CompletableFuture<Double> currentTemperature(String city) {
        throw new UnsupportedOperationException("TODO");
    }
}
