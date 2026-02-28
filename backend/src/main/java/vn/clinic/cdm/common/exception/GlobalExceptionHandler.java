package vn.clinic.cdm.common.exception;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import vn.clinic.cdm.api.dto.common.ApiResponse;

import java.time.Instant;
import java.util.stream.Collectors;

/**
 * Enterprise Global Exception Handler.
 * Responsibility: Centralized error handling, security-aware, and provides
 * structured feedback for UI and logging for Ops.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<ErrorDetails>> handleResourceNotFoundException(ResourceNotFoundException ex,
                        WebRequest request) {
                log.warn("Resource not found: {}", ex.getMessage());
                return createResponse(ex.getMessage(), request, HttpStatus.NOT_FOUND, "Not Found");
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ApiResponse<ErrorDetails>> handleIllegalStateException(IllegalStateException ex,
                        WebRequest request) {
                log.warn("Illegal state: {}", ex.getMessage());
                return createResponse(ex.getMessage(), request, HttpStatus.BAD_REQUEST, "Bad Request");
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<ErrorDetails>> handleIllegalArgumentException(IllegalArgumentException ex,
                        WebRequest request) {
                log.warn("Illegal argument: {}", ex.getMessage());
                return createResponse(ex.getMessage(), request, HttpStatus.BAD_REQUEST, "Bad Request");
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<ErrorDetails>> handleAccessDeniedException(AccessDeniedException ex,
                        WebRequest request) {
                log.warn("Unauthorized access attempt: {}", ex.getMessage());
                return createResponse("You do not have permission to perform this action", request,
                                HttpStatus.FORBIDDEN, "Forbidden");
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<ErrorDetails>> handleValidationException(MethodArgumentNotValidException ex,
                        WebRequest request) {
                String details = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> String.format("%s: %s", error.getField(), error.getDefaultMessage()))
                                .collect(Collectors.joining(", "));
                log.warn("Request validation failed: {}", details);
                return createResponse("Validation error", request, HttpStatus.BAD_REQUEST, "Bad Request", details);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiResponse<ErrorDetails>> handleHttpMessageNotReadable(
                        HttpMessageNotReadableException ex,
                        WebRequest request) {
                log.warn("Malformed JSON request: {}", ex.getMessage());
                return createResponse("Malformed JSON request", request, HttpStatus.BAD_REQUEST, "Bad Request");
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<ErrorDetails>> handleGlobalException(Exception ex, WebRequest request) {
                log.error("CRITICAL: Unexpected internal error", ex);
                return createResponse("An unexpected internal error occurred. Our engineers have been notified.",
                                request, HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }

        private ResponseEntity<ApiResponse<ErrorDetails>> createResponse(String message, WebRequest request,
                        HttpStatus status,
                        String error) {
                return createResponse(message, request, status, error, request.getDescription(false));
        }

        private ResponseEntity<ApiResponse<ErrorDetails>> createResponse(String message, WebRequest request,
                        HttpStatus status,
                        String error, String details) {
                ErrorDetails errorDetails = ErrorDetails.builder()
                                .timestamp(Instant.now())
                                .message(message)
                                .details(details)
                                .status(status.value())
                                .error(error)
                                .build();
                return new ResponseEntity<>(ApiResponse.<ErrorDetails>builder()
                                .success(false)
                                .message(message)
                                .data(errorDetails)
                                .timestamp(Instant.now())
                                .build(), status);
        }

        @Getter
        @Builder
        public static class ErrorDetails {
                private Instant timestamp;
                private String message;
                private String details;
                private int status;
                private String error;
        }
}

