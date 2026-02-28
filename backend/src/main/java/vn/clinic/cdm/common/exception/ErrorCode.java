package vn.clinic.cdm.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enterprise Error Codes for structured client feedback.
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Auth Errors
    AUTH_BAD_CREDENTIALS("A001", "Email hoặc mật khẩu không chính xác"),
    AUTH_SOCIAL_LOGIN_FAILED("A002", "Xác thực mạng xã hội thất bại"),
    AUTH_TENANT_REQUIRED("A003", "REQUIRE_TENANT_SELECTION"),
    AUTH_USER_NOT_FOUND("A004", "Tài khoản không tồn tại"),
    AUTH_USER_DISABLED("A005", "Tài khoản đã bị khóa"),

    // Resource Errors
    RESOURCE_NOT_FOUND("R001", "Không tìm thấy dữ liệu yêu cầu"),
    RESOURCE_ALREADY_EXISTS("R002", "Dữ liệu đã tồn tại trong hệ thống"),

    // General Errors
    VALIDATION_FAILED("G001", "Dữ liệu không hợp lệ"),
    INTERNAL_SERVER_ERROR("G002", "Lỗi xử lý nội bộ hệ thống");

    private final String code;
    private final String defaultMessage;
}
