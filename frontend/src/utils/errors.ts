import { ERROR_CODES } from '@/constants'

/**
 * Enterprise Error Utility to normalize and format errors for the UI.
 */
export const EnterpriseErrorUtils = {
    getMessage: (error: any): string => {
        if (typeof error === 'string') return error

        const code = error.errorCode || (error.details?.data?.errorCode)

        switch (code) {
            case ERROR_CODES.AUTH_BAD_CREDENTIALS:
                return 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.'
            case ERROR_CODES.AUTH_SOCIAL_LOGIN_FAILED:
                return 'Đăng nhập qua mạng xã hội không thành công. Vui lòng thử lại hoặc dùng email.'
            case ERROR_CODES.AUTH_TENANT_REQUIRED:
                return 'Vui lòng chọn phòng khám để tiếp tục.'
            case ERROR_CODES.AUTH_USER_NOT_FOUND:
                return 'Tài khoản không tồn tại trên hệ thống.'
            case ERROR_CODES.AUTH_USER_DISABLED:
                return 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
            default:
                return error.message || 'Hệ thống đang bận, vui lòng thử lại sau.'
        }
    }
}
