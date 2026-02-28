package vn.clinic.cdm.common.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Relaxed rate limits for dev: 500 requests per minute
    private final Bandwidth standardLimit = Bandwidth.classic(500, Refill.greedy(500, Duration.ofMinutes(1)));

    // Relaxed strict rate limit: 100 requests per minute
    private final Bandwidth strictLimit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1)));

    public Bucket resolveBucket(String key, boolean strict) {
        return buckets.computeIfAbsent(key + (strict ? "-strict" : "-std"), k -> {
            return Bucket.builder()
                    .addLimit(strict ? strictLimit : standardLimit)
                    .build();
        });
    }
}

