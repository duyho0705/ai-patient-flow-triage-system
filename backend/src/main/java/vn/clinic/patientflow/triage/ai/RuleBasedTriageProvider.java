package vn.clinic.patientflow.triage.ai;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import vn.clinic.patientflow.triage.ai.AiTriageService.TriageInput;
import vn.clinic.patientflow.triage.ai.AiTriageService.TriageSuggestionResult;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Rule-based provider: từ khóa lý do khám + ngưỡng sinh hiệu → gợi ý acuity.
 * ESI 5-level: 1=Resuscitation, 2=Emergent, 3=Urgent, 4=Less urgent, 5=Non-urgent.
 * Dùng cho MVP; sau thay bằng model/API bên ngoài.
 */
@Component
@ConditionalOnProperty(name = "triage.ai.provider", havingValue = "rule-based", matchIfMissing = true)
public class RuleBasedTriageProvider implements AiTriageProvider {

    private static final String LEVEL_1 = "1"; // Resuscitation
    private static final String LEVEL_2 = "2"; // Emergent
    private static final String LEVEL_3 = "3"; // Urgent
    private static final String LEVEL_4 = "4"; // Less urgent
    private static final String LEVEL_5 = "5"; // Non-urgent

    /** Từ khóa nguy hiểm (tiếng Việt/Anh) → level 1–2. */
    private static final Map<Pattern, String> HIGH_ACUITY_PATTERNS = Map.ofEntries(
            entry("đau ngực|tức ngực|chest pain|khó thở|suy hô hấp|shortness of breath", LEVEL_2),
            entry("ngất|bất tỉnh|syncope|unconscious", LEVEL_2),
            entry("co giật|seizure|động kinh", LEVEL_2),
            entry("chảy máu nhiều|mất máu|heavy bleeding|hemorrhage", LEVEL_2),
            entry("đột quỵ|stroke|tai biến", LEVEL_2),
            entry("ngừng thở|ngừng tim|cardiac arrest|CPR", LEVEL_1),
            entry("sốc|shock|sốc phản vệ", LEVEL_2),
            entry("ngộ độc|poisoning|tự tử|suicide", LEVEL_2),
            entry("chấn thương đầu nặng|head injury|chấn thương sọ", LEVEL_2)
    );

    /** Từ khóa trung bình → level 3. */
    private static final Map<Pattern, String> MID_ACUITY_PATTERNS = Map.ofEntries(
            entry("sốt cao|sốt trên 39|high fever", LEVEL_3),
            entry("đau bụng dữ dội|acute abdominal pain", LEVEL_3),
            entry("nôn ra máu|vomiting blood|ho ra máu", LEVEL_3),
            entry("bỏng|burn", LEVEL_3),
            entry("gãy xương|fracture|trật khớp", LEVEL_3),
            entry("vết thương sâu|laceration", LEVEL_3)
    );

    /** Từ khóa ít gấp → level 4–5. */
    private static final Map<Pattern, String> LOW_ACUITY_PATTERNS = Map.ofEntries(
            entry("ho|sổ mũi|cough|runny nose", LEVEL_5),
            entry("đau họng|sore throat", LEVEL_5),
            entry("đau đầu nhẹ|headache", LEVEL_4),
            entry("đau bụng nhẹ|mild abdominal", LEVEL_4),
            entry("tiêu chảy|diarrhea|táo bón", LEVEL_4),
            entry("khám sức khỏe|kiểm tra|check.up|vaccine|tiêm", LEVEL_5)
    );

    private static Map.Entry<Pattern, String> entry(String regex, String level) {
        return new AbstractMap.SimpleEntry<>(Pattern.compile(regex, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE), level);
    }

    @Override
    public TriageSuggestionResult suggest(TriageInput input) {
        String text = normalize(input.getChiefComplaintText());
        
        // Match level and capture reason
        MatchResult matchResult = matchLevelWithReason(text);
        String level = matchResult.level;
        String matchedPattern = matchResult.matchedPattern;
        
        // Build explanation
        StringBuilder explanation = new StringBuilder();
        explanation.append("Acuity ").append(level).append(": ");
        
        if (matchedPattern != null) {
            explanation.append("Detected '").append(matchedPattern).append("'");
        } else {
            explanation.append("No critical keywords");
        }
        
        // Check vitals for risk factors
        List<String> riskFactors = checkVitalsRisk(input.getVitals());
        if (!riskFactors.isEmpty()) {
            explanation.append(" + ").append(String.join(", ", riskFactors));
        }
        
        BigDecimal confidence = confidenceFromInput(text, input.getVitals(), level);
        
        return TriageSuggestionResult.builder()
                .suggestedAcuity(level)
                .confidence(confidence)
                .explanation(explanation.toString())
                .build();
    }

    @Override
    public String getProviderKey() {
        return "rule-based";
    }

    private String normalize(String s) {
        if (s == null || s.isBlank()) return "";
        return s.trim().toLowerCase(Locale.ROOT);
    }

    private MatchResult matchLevelWithReason(String text) {
        for (var e : HIGH_ACUITY_PATTERNS.entrySet()) {
            if (e.getKey().matcher(text).find()) {
                return new MatchResult(e.getValue(), extractFirstMatch(e.getKey(), text));
            }
        }
        for (var e : MID_ACUITY_PATTERNS.entrySet()) {
            if (e.getKey().matcher(text).find()) {
                return new MatchResult(e.getValue(), extractFirstMatch(e.getKey(), text));
            }
        }
        for (var e : LOW_ACUITY_PATTERNS.entrySet()) {
            if (e.getKey().matcher(text).find()) {
                return new MatchResult(e.getValue(), extractFirstMatch(e.getKey(), text));
            }
        }
        return new MatchResult(LEVEL_4, null); // default: less urgent
    }
    
    private String extractFirstMatch(Pattern pattern, String text) {
        var matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }
    
    private List<String> checkVitalsRisk(Map<String, BigDecimal> vitals) {
        List<String> risks = new ArrayList<>();
        if (vitals == null) return risks;
        
        BigDecimal spo2 = vitals.get("SPO2");
        BigDecimal temp = vitals.get("TEMPERATURE");
        BigDecimal hr = vitals.get("HEART_RATE");
        BigDecimal bpSys = vitals.get("BLOOD_PRESSURE_SYSTOLIC");
        
        if (spo2 != null && spo2.compareTo(new BigDecimal("92")) < 0) {
            risks.add("SpO2 " + spo2 + "% (low)");
        }
        if (temp != null && temp.compareTo(new BigDecimal("39")) >= 0) {
            risks.add("Temp " + temp + "°C (high)");
        }
        if (hr != null) {
            if (hr.compareTo(new BigDecimal("120")) > 0) {
                risks.add("HR " + hr + " (tachycardia)");
            } else if (hr.compareTo(new BigDecimal("50")) < 0) {
                risks.add("HR " + hr + " (bradycardia)");
            }
        }
        if (bpSys != null && bpSys.compareTo(new BigDecimal("180")) >= 0) {
            risks.add("BP " + bpSys + " (hypertension)");
        }
        
        return risks;
    }

    private BigDecimal confidenceFromInput(String text, Map<String, BigDecimal> vitals, String level) {
        double c = 0.6;
        if (text.length() > 10) c += 0.1;
        if (vitals != null && !vitals.isEmpty()) c += 0.15;
        if (LEVEL_1.equals(level) || LEVEL_2.equals(level)) c += 0.1;
        if (vitals != null) {
            BigDecimal temp = vitals.get("TEMPERATURE");
            BigDecimal hr = vitals.get("HEART_RATE");
            BigDecimal spo2 = vitals.get("SPO2");
            if (temp != null && temp.compareTo(new BigDecimal("39")) >= 0) c += 0.05;
            if (hr != null && (hr.compareTo(new BigDecimal("120")) > 0 || hr.compareTo(new BigDecimal("50")) < 0)) c += 0.05;
            if (spo2 != null && spo2.compareTo(new BigDecimal("92")) < 0) c += 0.1;
        }
        return BigDecimal.valueOf(Math.min(1.0, c)).setScale(2, RoundingMode.HALF_UP);
    }
    
    /** Helper class to hold match result with pattern info */
    private static class MatchResult {
        final String level;
        final String matchedPattern;
        
        MatchResult(String level, String matchedPattern) {
            this.level = level;
            this.matchedPattern = matchedPattern;
        }
    }
}
