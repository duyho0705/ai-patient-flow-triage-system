package vn.clinic.cdm.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base exception for enterprise API errors with specific ErrorCodes.
 */
@Getter
public class ApiException extends RuntimeException {
    private final ErrorCode errorCode;
    private final HttpStatus status;

    public ApiException(ErrorCode errorCode, HttpStatus status) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.status = status;
    }

    public ApiException(ErrorCode errorCode, HttpStatus status, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.status = status;
    }
}
