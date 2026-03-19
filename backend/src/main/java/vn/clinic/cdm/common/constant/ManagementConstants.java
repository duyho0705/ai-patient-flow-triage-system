package vn.clinic.cdm.common.constant;

/**
 * Global constants for the CDM platform.
 */
public final class ManagementConstants {
    private ManagementConstants() {
    }

    public static final class Roles {
        public static final String PATIENT = "PATIENT";
        public static final String DOCTOR = "DOCTOR";
        public static final String CLINIC_MANAGER = "CLINIC_MANAGER";
        public static final String ADMIN = "ADMIN";
    }

    public static final class AppointmentStatus {
        public static final String SCHEDULED = "SCHEDULED";
        public static final String CONFIRMED = "CONFIRMED";
        public static final String ARRIVED = "ARRIVED";
        public static final String COMPLETED = "COMPLETED";
        public static final String CANCELLED = "CANCELLED";
        public static final String NO_SHOW = "NO_SHOW";
    }

    public static final class RiskLevel {
        public static final String CRITICAL = "CRITICAL";
        public static final String HIGH = "HIGH";
        public static final String MEDIUM = "MEDIUM";
        public static final String LOW = "LOW";
    }

    public static final class Profile {
        public static final String DEFAULT_DOB = "1990-01-01";
    }
}
