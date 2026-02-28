package vn.clinic.cdm.common.exception;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import org.springframework.http.ProblemDetail;
import java.net.URI;
import java.util.stream.Collectors;

/**
 * Enterprise Global Exception Handler (RFC 7807 Compliant).
 * Responsibility: Centralized error handling providing ProblemDetail responses.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(ApiException.class)
        public ProblemDetail handleApiException(ApiException ex, WebRequest request) {
                return createProblemDetail(ex, ex.getStatus(), ex.getErrorCode(), ex.getMessage(), request);
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ProblemDetail handleBadCredentialsException(BadCredentialsException ex, WebRequest request) {
                log.warn("Authentication failed: {}", ex.getMessage());
                ErrorCode code = ex.getMessage().equals("REQUIRE_TENANT_SELECTION")
                                ? ErrorCode.AUTH_TENANT_REQUIRED
                                : ErrorCode.AUTH_BAD_CREDENTIALS;
                return createProblemDetail(ex, HttpStatus.UNAUTHORIZED, code, "Unauthorized", request);
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ProblemDetail handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
                log.warn("Resource not found: {}", ex.getMessage());
                return createProblemDetail(ex, HttpStatus.NOT_FOUND, ErrorCode.RESOURCE_NOT_FOUND, ex.getMessage(),
                                request);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ProblemDetail handleValidationException(MethodArgumentNotValidException ex, WebRequest request) {
                String details = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> String.format("%s: %s", error.getField(), error.getDefaultMessage()))
                                .collect(Collectors.joining(", "));
                log.warn("Request validation failed: {}", details);
                return createProblemDetail(ex, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, details, request);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ProblemDetail handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
                log.warn("Unauthorized access attempt: {}", ex.getMessage());
                return createProblemDetail(ex, HttpStatus.FORBIDDEN, ErrorCode.VALIDATION_FAILED, "Forbidden", request);
        }

        @ExceptionHandler(Exception.class)
        public ProblemDetail handleGlobalException(Exception ex, WebRequest request) {
                log.error("CRITICAL: Unexpected internal error", ex);
                return createProblemDetail(ex, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_SERVER_ERROR,
                                "An unexpected internal error occurred.", request);
        }

        private ProblemDetail createProblemDetail(Exception ex, HttpStatus status, ErrorCode errorCode, String detail,
                        WebRequest request) {
                ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, detail);
                problemDetail.setTitle(ex.getClass().getSimpleName());
                problemDetail.setType(URI.create("urn:problem-type:" + errorCode.getCode()));
                problemDetail.setProperty("errorCode", errorCode.getCode());
                problemDetail.setProperty("timestamp", Instant.now());
                // For backwards compatibility with old frontend clients that expect generic
                // error message
                problemDetail.setProperty("message", detail);
                problemDetail.setProperty("success", false);
                return problemDetail;
        }
}
