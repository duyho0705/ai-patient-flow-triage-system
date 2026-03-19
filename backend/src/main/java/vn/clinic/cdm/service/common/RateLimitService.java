package vn.clinic.cdm.service.common;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class RateLimitService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    // Relaxed rate limits for dev: 500 requests per minute
    private final Bandwidth standardLimit = Bandwidth.builder().capacity(500).refillGreedy(500, Duration.ofMinutes(1)).build();

    // Relaxed strict rate limit: 100 requests per minute
    private final Bandwidth strictLimit = Bandwidth.builder().capacity(100).refillGreedy(100, Duration.ofMinutes(1)).build();

    public Bucket resolveBucket(String key, boolean strict) {
        String cacheKey = key + (strict ? "-strict" : "-std");
        return cache.computeIfAbsent(cacheKey, k -> Bucket.builder()
                .addLimit(strict ? strictLimit : standardLimit)
                .build());
    }
}

