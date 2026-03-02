package vn.clinic.cdm.common;

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
        public static final String ADMIN = "SYSTEM_ADMIN";
    }

    public static final class Profile {
        public static final String DEFAULT_DOB = "1990-01-01";
    }
}
