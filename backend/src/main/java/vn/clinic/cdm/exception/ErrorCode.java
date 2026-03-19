package vn.clinic.cdm.exception;

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
    AUTH_TENANT_REQUIRED("A003", "REQUIRE_TENANT_SELECTION"),
    AUTH_USER_NOT_FOUND("A004", "Tài khoản không tồn tại"),
    AUTH_USER_DISABLED("A005", "Tài khoản đã bị khóa"),
    USER_ALREADY_EXISTS("A006", "Email đã tồn tại trên hệ thống"),

    // Resource Errors
    RESOURCE_NOT_FOUND("R001", "Không tìm thấy dữ liệu yêu cầu"),
    RESOURCE_ALREADY_EXISTS("R002", "Dữ liệu đã tồn tại trong hệ thống"),
    INVALID_OPERATION("R003", "Thao tác không hợp lệ trên dữ liệu hiện tại"),

    // Business Logic Errors
    SCHEDULING_CONFLICT("B001", "Lịch hẹn đã bị trùng hoặc không khả dụng"),
    PATIENT_ALREADY_EXISTS("B002", "Bệnh nhân này đã có thông tin trong hệ thống"),
    CLINICAL_ACCESS_DENIED("B003", "Bạn không có quyền truy cập thông tin lâm sàng này"),

    // General Errors
    VALIDATION_FAILED("G001", "Dữ liệu không hợp lệ"),
    TOO_MANY_REQUESTS("G002", "Quá nhiều yêu cầu, vui lòng thử lại sau"),
    INTERNAL_SERVER_ERROR("G003", "Lỗi xử lý nội bộ hệ thống");

    private final String code;
    private final String defaultMessage;
}
