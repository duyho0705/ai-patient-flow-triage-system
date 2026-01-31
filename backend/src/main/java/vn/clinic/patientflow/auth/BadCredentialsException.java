package vn.clinic.patientflow.auth;

/**
 * Lỗi đăng nhập – sai mật khẩu hoặc không có quyền tenant/branch.
 */
public class BadCredentialsException extends RuntimeException {

    public BadCredentialsException(String message) {
        super(message);
    }
}
