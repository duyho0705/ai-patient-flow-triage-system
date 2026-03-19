package vn.clinic.cdm.common.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Utility class for handling Vietnamese strings and names.
 */
public final class VNStringUtils {

    private VNStringUtils() {}

    /**
     * Extracts initials from a Vietnamese full name.
     * Example: "Nguyễn Văn A" -> "NA"
     */
    public static String getInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "BN";
        
        String cleanName = removeAccents(fullName).trim();
        String[] parts = cleanName.split("\\s+");
        
        if (parts.length >= 2) {
            String first = parts[0].substring(0, 1);
            String last = parts[parts.length - 1].substring(0, 1);
            return (first + last).toUpperCase();
        }
        
        return cleanName.substring(0, Math.min(2, cleanName.length())).toUpperCase();
    }

    /**
     * Removes Vietnamese accents from a string.
     */
    public static String removeAccents(String s) {
        if (s == null) return null;
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("")
                .replace('đ', 'd').replace('Đ', 'D');
    }
}
