package vn.clinic.cdm.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility for easy JSON serialization/deserialization.
 */
@Slf4j
public final class JsonUtils {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private JsonUtils() {}

    /**
     * Converts an object to JSON string.
     */
    public static String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return MAPPER.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize object to JSON: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Parses JSON string to an object of specified type.
     */
    public static <T> T fromJson(String json, Class<T> type) {
        if (json == null || json.isBlank()) return null;
        try {
            return MAPPER.readValue(json, type);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse JSON string: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extracts JSON content from AI-wrapped responses (e.g. ```json ... ```)
     */
    public static String extractJson(String raw) {
        if (raw == null) return null;
        if (raw.contains("{")) {
            return raw.substring(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
        }
        return raw;
    }
}
