package vn.clinic.cdm.common.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Utility for unified date/time handling across the system.
 */
public final class DateTimeUtils {

    private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private DateTimeUtils() {}

    /**
     * Gets start of day (00:00:00) for a LocalDate as Instant.
     */
    public static Instant atStartOfDay(LocalDate date) {
        if (date == null) return null;
        return date.atStartOfDay(DEFAULT_ZONE).toInstant();
    }

    /**
     * Gets end of day (23:59:59) for a LocalDate as Instant.
     */
    public static Instant atEndOfDay(LocalDate date) {
        if (date == null) return null;
        return date.plusDays(1).atStartOfDay(DEFAULT_ZONE).toInstant();
    }

    /**
     * Formats current date as dd/MM/yyyy.
     */
    public static String formatToday() {
        return LocalDate.now().format(DATE_FORMAT);
    }

    /**
     * Formats LocalDate as dd/MM/yyyy.
     */
    public static String format(LocalDate date) {
        if (date == null) return "N/A";
        return date.format(DATE_FORMAT);
    }
}
