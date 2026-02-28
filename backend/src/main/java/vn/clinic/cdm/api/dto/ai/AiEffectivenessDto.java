package vn.clinic.cdm.api.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * Report DTO: Tá»· lá»‡ hiá»‡u quáº£ cá»§a AI trong phÃ¢n loáº¡i bá»‡nh nhÃ¢n.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiEffectivenessDto {

    private String branchId;
    private String branchName;
    private LocalDate fromDate;
    private LocalDate toDate;

    /** Tá»•ng sá»‘ phiÃªn phÃ¢n loáº¡i trong ká»³. */
    private long totalSessions;
    /** Sá»‘ phiÃªn cÃ³ dÃ¹ng gá»£i Ã½ AI (acuity_source = AI hoáº·c HYBRID). */
    private long aiSessions;
    /** Sá»‘ phiÃªn chá»‰ do ngÆ°á»i (acuity_source = HUMAN). */
    private long humanSessions;

    /**
     * Sá»‘ phiÃªn cÃ³ AI gá»£i Ã½ mÃ  bÃ¡c sÄ©/y tÃ¡ cháº¥p nháº­n (ai_suggested_acuity =
     * acuity_level).
     */
    private long matchCount;
    /** Sá»‘ phiÃªn cÃ³ ghi override (override_reason not null). */
    private long overrideCount;

    /** Tá»· lá»‡ khá»›p (matchCount / aiSessions) náº¿u aiSessions > 0, 0â€“1. */
    private Double matchRate;
    /** Tá»· lá»‡ override (overrideCount / aiSessions) náº¿u aiSessions > 0, 0â€“1. */
    private Double overrideRate;
}

