package vn.clinic.cdm.entity.clinical;

import java.math.BigDecimal;

/**
 * Enterprise Clinical Constants for Vital Signs thresholds and labels.
 * Centralizing this ensures consistency across Patient Portal and Risk Assessment.
 */
public class VitalSignsThresholds {

    public static boolean isAbnormal(String type, BigDecimal value) {
        if (value == null) return false;
        double val = value.doubleValue();
        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE" -> val > 180 || val < 70;
            case "BLOOD_PRESSURE_SYS" -> val > 140;
            case "BLOOD_PRESSURE_DIA" -> val > 90;
            case "HEART_RATE" -> val > 100 || val < 50;
            case "SPO2" -> val < 94;
            default -> false;
        };
    }

    public static boolean isCritical(String type, BigDecimal value) {
        if (value == null) return false;
        double val = value.doubleValue();
        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE" -> val > 300 || val < 55;
            case "BLOOD_PRESSURE_SYS" -> val > 180 || val < 80;
            case "BLOOD_PRESSURE_DIA" -> val > 110;
            case "SPO2" -> val < 88;
            case "HEART_RATE" -> val > 130 || val < 45;
            default -> false;
        };
    }

    public static String getLabel(String type) {
        return switch (type.toUpperCase()) {
            case "BLOOD_GLUCOSE" -> "Đường huyết";
            case "BLOOD_PRESSURE_SYS" -> "Huyết áp (Tâm thu)";
            case "BLOOD_PRESSURE_DIA" -> "Huyết áp (Tâm trương)";
            case "SPO2" -> "SpO2";
            case "HEART_RATE" -> "Nhịp tim";
            default -> type;
        };
    }
}
