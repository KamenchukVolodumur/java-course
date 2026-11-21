package pl.mini.chat;

import java.util.concurrent.CompletableFuture;

@FunctionalInterface
public interface WeatherProvider {
    /** NaN if the city is not found. */
    CompletableFuture<Double> currentTemperature(String city);
}
