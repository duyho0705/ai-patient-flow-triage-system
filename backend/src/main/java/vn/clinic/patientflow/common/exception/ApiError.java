package vn.clinic.patientflow.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

/**
 * Standard API error body (RFC 7807–style).
 */
@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    Instant timestamp;
    int status;
    String error;
    String message;
    String path;
    String resource;
    String identifier;
    List<FieldError> errors;

    @Value
    @Builder
    public static class FieldError {
        String field;
        String message;
    }
}
