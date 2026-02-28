package vn.clinic.cdm.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

/**
 * Enterprise Multi-Tier Cache Configuration.
 * 
 * Cache Tiers:
 * - HOT (short TTL): Real-time dashboards, queue status â†’ 2 min
 * - WARM (medium TTL): AI CDS advice, clinical support â†’ 15 min
 * - COLD (long TTL): Prescription templates, static lookups â†’ 60 min
 * 
 * All caches use Caffeine (in-process, zero-latency) with recordStats() for
 * monitoring.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(List.of(
                buildCache("dashboards", Duration.ofMinutes(2), 200),
                buildCache("cds_advice", Duration.ofMinutes(15), 500),
                buildCache("ai_support", Duration.ofMinutes(15), 500),
                buildCache("prescription_templates", Duration.ofHours(1), 100),
                buildCache("patient_context", Duration.ofMinutes(10), 300)));
        return cacheManager;
    }

    private CaffeineCache buildCache(String name, Duration ttl, long maxSize) {
        return new CaffeineCache(name, Caffeine.newBuilder()
                .expireAfterWrite(ttl)
                .maximumSize(maxSize)
                .recordStats()
                .build());
    }
}

