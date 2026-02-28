package vn.clinic.cdm.clinical.service;

import org.springframework.stereotype.Component;

/**
 * Enterprise Prompt Registry.
 * Centralizes all AI prompts for version control, localization, and testing.
 * Future enhancement: Load from Database or Config Server for hot-swapping.
 */
@Component
public class PromptRegistry {

        public static final String VERSION = "2.0.0-ENT";

        public String getCdsAdvicePrompt(String context) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ Há»† THá»NG Há»– TRá»¢ QUYáº¾T Äá»ŠNH LÃ‚M SÃ€NG (CDS) DOANH NGHIá»†P.\n" +
                                                "GUIDELINE: Bá»™ Y Táº¿ Viá»‡t Nam & WHO.\n\n" +
                                                "CONTEXT Bá»†NH NHÃ‚N:\n%s\n\n" +
                                                "NHIá»†M Vá»¤:\n" +
                                                "1. PhÃ¢n tÃ­ch cÃ¡c chá»‰ sá»‘ báº¥t thÆ°á»ng nguy cáº¥p.\n" +
                                                "2. Äá» xuáº¥t cÃ¡c rá»§i ro tÆ°Æ¡ng tÃ¡c hoáº·c chá»‘ng chá»‰ Ä‘á»‹nh.\n" +
                                                "3. Gá»£i Ã½ cháº©n Ä‘oÃ¡n phÃ¢n biá»‡t dá»±a trÃªn triá»‡u chá»©ng.\n\n" +
                                                "OUTPUT FORMAT (STRICT JSON ONLY):\n" +
                                                "{\n" +
                                                "  \"riskLevel\": \"LOW|MEDIUM|HIGH|CRITICAL\",\n" +
                                                "  \"summary\": \"TÃ³m táº¯t lÃ¢m sÃ ng\",\n" +
                                                "  \"warnings\": [ { \"type\": \"INTERACTION|VITAL_ALARM\", \"message\": \"...\", \"severity\": \"ERROR|WARNING\" } ],\n"
                                                +
                                                "  \"suggestions\": [ { \"title\": \"...\", \"reason\": \"...\", \"actionType\": \"LAB_ORDER|IMAGING\" } ],\n"
                                                +
                                                "  \"differentialDiagnoses\": [ \"ICD-10 Code\" ],\n" +
                                                "  \"aiReasoning\": \"PhÃ¢n tÃ­ch chuyÃªn sÃ¢u (Professional Clinical Reasoning)\"\n"
                                                +
                                                "}\n",
                                context);
        }

        public String getClinicalSupportPrompt(String context) {
                return String.format(
                                "SYSTEM: AI CLINICAL ASSISTANT.\n\n" +
                                                "Dá»® LIá»†U LÃ‚M SÃ€NG:\n%s\n\n" +
                                                "YÃŠU Cáº¦U: PhÃ¢n tÃ­ch ká»¹ lÆ°á»¡ng vÃ  Ä‘Æ°a ra tÃ³m táº¯t bá»‡nh Ã¡n, Ä‘Ã¡nh giÃ¡ sinh hiá»‡u, gá»£i Ã½ cháº©n Ä‘oÃ¡n ICD-10 vÃ  cáº£nh bÃ¡o rá»§i ro.",
                                context);
        }

        public String getEarlyWarningPrompt(String patientData, String vitalHistory) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ 'ENTERPRISE CLINICAL DETERIORATION MONITORING SYSTEM'.\n" +
                                                "NHIá»†M Vá»¤: PhÃ¢n tÃ­ch sinh hiá»‡u bá»‡nh nhÃ¢n vÃ  tráº£ vá» cáº£nh bÃ¡o lÃ¢m sÃ ng (NEWS2-based).\n\n"
                                                +
                                                "Dá»® LIá»†U Bá»†NH NHÃ‚N:\n%s\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON (CHá»ˆ TRáº¢ Vá»€ JSON):\n" +
                                                "{\n" +
                                                "  \"news2Score\": 0,\n" +
                                                "  \"riskLevel\": \"LOW|MEDIUM|HIGH\",\n" +
                                                "  \"monitoringFrequency\": \"Táº§n suáº¥t theo dÃµi Ä‘á» xuáº¥t\",\n" +
                                                "  \"warnings\": [ { \"vitalType\": \"...\", \"value\": \"...\", \"pointsContributed\": 0, \"trend\": \"STABLE|WORSENING|IMPROVING\" } ],\n"
                                                +
                                                "  \"aiClinicalAssessment\": \"ÄÃ¡nh giÃ¡ nguy cÆ¡ diá»…n tiáº¿n náº·ng\",\n" +
                                                "  \"escalationProtocol\": \"Quy trÃ¬nh xá»­ lÃ½ kháº©n cáº¥p\"\n" +
                                                "}",
                                patientData, vitalHistory);
        }

        public String getClinicalChatPrompt(String context, String userMessage, String history) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ AI CLINICAL ASSISTANT ÄANG Há»– TRá»¢ TRá»°C TIáº¾P CHO BÃC SÄ¨.\n\n" +
                                                "Bá»I Cáº¢NH LÃ‚M SÃ€NG:\n%s\n\n" +
                                                "Lá»ŠCH Sá»¬ Há»˜I THOáº I:\n%s\n\n" +
                                                "CÃ‚U Há»ŽI Má»šI: %s\n\n" +
                                                "YÃŠU Cáº¦U: Tráº£ lá»i ngáº¯n gá»n, chuyÃªn mÃ´n cao, dá»±a trÃªn dá»¯ liá»‡u bá»‡nh nhÃ¢n.",
                                context, history, userMessage);
        }

        public String getCarePlanPrompt(String context) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA HOáº CH Äá»ŠNH CHÄ‚M SÃ“C Sá»¨C KHá»ŽE CÃ NHÃ‚N HÃ“A (CDM SPECIALIST).\n\n"
                                                +
                                                "Dá»® LIá»†U LÃ‚M SÃ€NG & Bá»†NH Ná»€N:\n%s\n\n" +
                                                "NHIá»†M Vá»¤: Táº¡o káº¿ hoáº¡ch chÄƒm sÃ³c vÃ  Ä‘iá»u trá»‹ dÃ i háº¡n.\n" +
                                                "YÃŠU Cáº¦U CHI TIáº¾T:\n" +
                                                "1. Äá»‘i soÃ¡t sinh hiá»‡u vá»›i ngÆ°á»¡ng má»¥c tiÃªu cÃ¡ nhÃ¢n (náº¿u cÃ³).\n" +
                                                "2. ÄÃ¡nh giÃ¡ tuÃ¢n thá»§ thuá»‘c: Náº¿u Adherence Score < 80%%, pháº£i Ä‘Æ°a ra giáº£i phÃ¡p nháº¯c nhá»Ÿ hoáº·c giÃ¡o dá»¥c sá»©c khá»e.\n"
                                                +
                                                "3. Káº¿ hoáº¡ch Äƒn uá»‘ng, táº­p luyá»‡n chuyÃªn biá»‡t cho loáº¡i bá»‡nh mÃ£n tÃ­nh (Tiá»ƒu Ä‘Æ°á»ng, Cao huyáº¿t Ã¡p, v.v.).\n"
                                                +
                                                "4. Dáº¥u hiá»‡u trá»Ÿ náº·ng (Exacerbation) cáº§n nháº­p viá»‡n kháº©n cáº¥p.\n\n" +
                                                "FORMAT: Markdown professional (Vietnamese).\n" +
                                                "PHONG CÃCH: Tháº¥u hiá»ƒu, khoa há»c, thá»±c thi Ä‘Æ°á»£c (Actionable).",
                                context);
        }

        public String getPrescriptionVerifyPrompt(String patientData, String prescriptionData) {
                return String.format(
                                "SYSTEM: CHUYÃŠN GIA DÆ¯á»¢C LÃ‚M SÃ€NG DOANH NGHIá»†P.\n\n" +
                                                "Bá»I Cáº¢NH Bá»†NH NHÃ‚N:\n%s\n\n" +
                                                "Ná»˜I DUNG ÄÆ N THUá»C:\n%s\n\n" +
                                                "NHIá»†M Vá»¤:\n" +
                                                "1. Kiá»ƒm tra tÆ°Æ¡ng tÃ¡c thuá»‘c, chá»‘ng chá»‰ Ä‘á»‹nh, dá»‹ á»©ng.\n" +
                                                "2. ÄÃ¡nh giÃ¡ liá»u lÆ°á»£ng dá»±a trÃªn cÃ¢n náº·ng/tuá»•i/vitals.\n" +
                                                "3. Gá»£i Ã½ tá»‘i Æ°u hÃ³a (vÃ­ dá»¥: dÃ¹ng thuá»‘c generic tÆ°Æ¡ng Ä‘Æ°Æ¡ng Ä‘á»ƒ giáº£m chi phÃ­).\n\n"
                                                +
                                                "OUTPUT FORMAT (STRICT JSON ONLY):\n" +
                                                "{\n" +
                                                "  \"status\": \"SAFE|WARNING|DANGEROUS\",\n" +
                                                "  \"summary\": \"TÃ³m táº¯t Ä‘Ã¡nh giÃ¡\",\n" +
                                                "  \"warnings\": [ { \"type\": \"INTERACTION|ALLERGY|DOSAGE\", \"message\": \"...\", \"severity\": \"INFO|WARNING|CRITICAL\" } ],\n"
                                                +
                                                "  \"suggestions\": [ { \"originalMedication\": \"...\", \"suggestedAlternative\": \"...\", \"reason\": \"COST_SAVING|EFFICACY\" } ],\n"
                                                +
                                                "  \"aiReasoning\": \"PhÃ¢n tÃ­ch chuyÃªn mÃ´n sÃ¢u\"\n" +
                                                "}",
                                patientData, prescriptionData);
        }

        public String getPatientHistorySummaryPrompt(String patientName, String historyJson) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA TÃ“M Táº®T Há»’ SÆ  Bá»†NH ÃN.\n" +
                                                "NHIá»†M Vá»¤: TÃ³m táº¯t ngáº¯n gá»n nhÆ°ng Ä‘áº§y Ä‘á»§ cÃ¡c Ä‘iá»ƒm quan trá»ng trong lá»‹ch sá»­ khÃ¡m cá»§a bá»‡nh nhÃ¢n.\n\n"
                                                +
                                                "Bá»†NH NHÃ‚N: %s\n" +
                                                "Lá»ŠCH Sá»¬ KHÃM:\n%s\n\n" +
                                                "YÃŠU Cáº¦U: Chia thÃ nh cÃ¡c má»¥c (Cháº©n Ä‘oÃ¡n gáº§n Ä‘Ã¢y, Thuá»‘c Ä‘ang dÃ¹ng, LÆ°u Ã½ Ä‘áº·c biá»‡t).",
                                patientName, historyJson);
        }

        public String getSuggestTemplatesPrompt(String context, String templatesJson) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ Cá» Váº¤N LÃ‚M SÃ€NG.\n" +
                                                "NHIá»†M Vá»¤: Dá»±a trÃªn cháº©n Ä‘oÃ¡n hiá»‡n táº¡i, hÃ£y gá»£i Ã½ phÃ¡c Ä‘á»“/máº«u Ä‘Æ¡n thuá»‘c phÃ¹ há»£p nháº¥t tá»« danh sÃ¡ch máº«u cÃ³ sáºµn.\n\n"
                                                +
                                                "Bá»I Cáº¢NH HIá»†N Táº I:\n%s\n\n" +
                                                "DANH SÃCH MáºªU:\n%s\n\n" +
                                                "YÃŠU Cáº¦U: Chá»‰ ra táº¡i sao máº«u Ä‘Ã³ láº¡i phÃ¹ há»£p.",
                                context, templatesJson);
        }

        public String getOperationalInsightsPrompt(String context) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ 'ENTERPRISE CLINIC OPERATIONAL CONSULTANT'.\n" +
                                                "NHIá»†M Vá»¤: PhÃ¢n tÃ­ch bá»™ dá»¯ liá»‡u váº­n hÃ nh vÃ  tráº£ vá» káº¿t quáº£ dÆ°á»›i dáº¡ng JSON.\n\n"
                                                +
                                                "Dá»® LIá»†U Váº¬N HÃ€NH:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON (CHá»ˆ TRáº¢ Vá»€ JSON):\n" +
                                                "{\n" +
                                                "  \"executiveSummary\": \"TÃ³m táº¯t (2-3 cÃ¢u)\",\n" +
                                                "  \"metrics\": [ { \"name\": \"...\", \"value\": \"...\", \"status\": \"IMPROVING|DECLINING|STABLE\", \"insight\": \"...\" } ],\n"
                                                +
                                                "  \"recommendations\": [ { \"title\": \"...\", \"description\": \"...\", \"priority\": \"HIGH|MEDIUM|LOW\", \"impact\": \"...\" } ],\n"
                                                +
                                                "  \"forecasts\": [ { \"date\": \"...\", \"predictedVolume\": 0, \"predictedRevenue\": 0, \"confidence\": \"HI|MED|LO\" } ],\n"
                                                +
                                                "  \"leakageAlerts\": [ { \"patientId\": \"...\", \"patientName\": \"...\", \"missingType\": \"NO_INVOICE|UNPAID_RX\", \"potentialValue\": \"...\", \"details\": \"...\" } ],\n"
                                                +
                                                "  \"riskAssessment\": \"ÄÃ¡nh giÃ¡ rá»§i ro váº­n hÃ nh\"\n" +
                                                "}",
                                context);
        }

        public String getIcd10CodingPrompt(String diagnosisNotes) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA MÃƒ HÃ“A Bá»†NH Táº¬T (ICD-10 CODER).\n" +
                                                "NHIá»†M Vá»¤: Dá»±a trÃªn ghi chÃº cháº©n Ä‘oÃ¡n cá»§a bÃ¡c sÄ©, hÃ£y tÃ¬m mÃ£ ICD-10 phÃ¹ há»£p nháº¥t.\n\n"
                                                +
                                                "GHI CHÃš CHáº¨N ÄOÃN: %s\n\n" +
                                                "YÃŠU Cáº¦U JSON (CHá»ˆ TRáº¢ Vá»€ JSON):\n" +
                                                "{\n" +
                                                "  \"primaryCode\": \"MÃ£ ICD-10 chÃ­nh (VÃ­ dá»¥: E11.9)\",\n" +
                                                "  \"description\": \"TÃªn bá»‡nh tiáº¿ng Viá»‡t theo Bá»™ Y Táº¿\",\n" +
                                                "  \"confidence\": 0.0-1.0,\n" +
                                                "  \"alternativeCodes\": [ {\"code\": \"...\", \"description\": \"...\"} ]\n"
                                                +
                                                "}",
                                diagnosisNotes);
        }

        public String getPatientHealthSummaryPrompt(String patientName, String medicalDataJson) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ TRá»¢ LÃ Y Táº¾ AI CAO Cáº¤P.\n" +
                                                "NHIá»†M Vá»¤: Tá»•ng há»£p há»“ sÆ¡ sá»©c khá»e cá»§a bá»‡nh nhÃ¢n thÃ nh má»™t bÃ¡o cÃ¡o chuyÃªn nghiá»‡p, dá»… hiá»ƒu.\n\n"
                                                +
                                                "Bá»†NH NHÃ‚N: %s\n" +
                                                "Dá»® LIá»†U Y Táº¾:\n%s\n\n" +
                                                "YÃŠU Cáº¦U Ná»˜I DUNG:\n" +
                                                "1. TÃ¬nh tráº¡ng chung: TÃ³m táº¯t ngáº¯n gá»n.\n" +
                                                "2. Chá»‰ sá»‘ sinh hiá»‡u: ÄÃ¡nh giÃ¡ cÃ¡c chá»‰ sá»‘ gáº§n nháº¥t (Huyáº¿t Ã¡p, SpO2, v.v.).\n"
                                                +
                                                "3. Lá»‹ch sá»­ bá»‡nh lÃ½: CÃ¡c cháº©n Ä‘oÃ¡n quan trá»ng gáº§n Ä‘Ã¢y.\n" +
                                                "4. Khuyáº¿n nghá»‹ Lifestyle: TÆ° váº¥n sá»©c khá»e cÃ¡ nhÃ¢n hÃ³a.\n" +
                                                "5. Cáº£nh bÃ¡o (náº¿u cÃ³): CÃ¡c dáº¥u hiá»‡u cáº§n tÃ¡i khÃ¡m ngay.\n\n" +
                                                "PHONG CÃCH: ChuyÃªn nghiá»‡p, an tÃ¢m, tiáº¿ng Viá»‡t chuáº©n y khoa.",
                                patientName, medicalDataJson);
        }

        public String getPharmacyDrugSearchPrompt(String query) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA DÆ¯á»¢C LÃ‚M SÃ€NG.\n" +
                                                "NHIá»†M Vá»¤: Cung cáº¥p thÃ´ng tin chi tiáº¿t vá» thuá»‘c dá»±a trÃªn truy váº¥n.\n\n"
                                                +
                                                "TRUY Váº¤N: %s\n\n" +
                                                "YÃŠU Cáº¦U Ná»˜I DUNG:\n" +
                                                "1. ThÃ nh pháº§n hoáº¡t cháº¥t.\n" +
                                                "2. Chá»‰ Ä‘á»‹nh & Liá»u dÃ¹ng thÃ´ng thÆ°á»ng.\n" +
                                                "3. Chá»‘ng chá»‰ Ä‘á»‹nh quan trá»ng.\n" +
                                                "4. LÆ°u Ã½ khi cáº¥p phÃ¡t (vÃ­ dá»¥: uá»‘ng lÃºc Ä‘Ã³i/no).\n\n" +
                                                "PHONG CÃCH: ChÃ­nh xÃ¡c, sÃºc tÃ­ch, theo dÆ°á»£c Ä‘iá»ƒn.",
                                query);
        }

        public String getPharmacyInteractionCheckPrompt(String drugsList) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ Há»† THá»NG KIá»‚M TRA TÆ¯Æ NG TÃC THUá»C.\n" +
                                                "NHIá»†M Vá»¤: PhÃ¢n tÃ­ch tÆ°Æ¡ng tÃ¡c giá»¯a cÃ¡c loáº¡i thuá»‘c trong danh sÃ¡ch.\n\n"
                                                +
                                                "DANH SÃCH THUá»C:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON:\n" +
                                                "{\n" +
                                                "  \"severity\": \"LOW/MEDIUM/HIGH/CONTRAINDICATED\",\n" +
                                                "  \"summary\": \"TÃ³m táº¯t tÆ°Æ¡ng tÃ¡c\",\n" +
                                                "  \"details\": \"Chi tiáº¿t cÆ¡ cháº¿ (náº¿u cÃ³)\",\n" +
                                                "  \"recommendation\": \"Lá»i khuyÃªn cho dÆ°á»£c sÄ©\"\n" +
                                                "}",
                                drugsList);
        }

        public String getDifferentialDiagnosisPrompt(String clinicalContext) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA CHáº¨N ÄOÃN LÃ‚M SÃ€NG.\n" +
                                                "NHIá»†M Vá»¤: Dá»±a trÃªn bá»‘i cáº£nh hiá»‡n táº¡i, hÃ£y gá»£i Ã½ danh sÃ¡ch cháº©n Ä‘oÃ¡n phÃ¢n biá»‡t (Differential Diagnosis).\n\n"
                                                +
                                                "Bá»I Cáº¢NH LÃ‚M SÃ€NG:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON:\n" +
                                                "{\n" +
                                                "  \"primaryDiagnosis\": \"Cháº©n Ä‘oÃ¡n kháº£ thi nháº¥t\",\n" +
                                                "  \"differentials\": [\n" +
                                                "    { \"disease\": \"TÃªn bá»‡nh\", \"probability\": \"Cao/Trung bÃ¬nh/Tháº¥p\", \"reasoning\": \"Táº¡i sao nghÄ© Ä‘áº¿n bá»‡nh nÃ y\", \"tests\": \"XÃ©t nghiá»‡m gá»£i Ã½\" }\n"
                                                +
                                                "  ],\n" +
                                                "  \"redFlags\": [ \"CÃ¡c dáº¥u hiá»‡u nguy hiá»ƒm cáº§n loáº¡i trá»« ngay\" ]\n" +
                                                "}",
                                clinicalContext);
        }

        public String getClinicalChecklistPrompt(String medicalContext) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA HÆ¯á»šNG DáºªN THÄ‚M KHÃM LÃ‚M SÃ€NG.\n" +
                                                "NHIá»†M Vá»¤: Dá»±a trÃªn tÃ¬nh tráº¡ng bá»‡nh nhÃ¢n, hÃ£y gá»£i Ã½ cÃ¡c Ä‘áº§u má»¥c bÃ¡c sÄ© cáº§n kiá»ƒm tra ká»¹.\n\n"
                                                +
                                                "Bá»I Cáº¢NH LÃ‚M SÃ€NG:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON:\n" +
                                                "{\n" +
                                                "  \"physicalExams\": [ \"CÃ¡c má»¥c cáº§n khÃ¡m thá»ƒ cháº¥t (vÃ­ dá»¥: Nghe phá»•i, sá» bá»¥ng)\" ],\n"
                                                +
                                                "  \"historyQuestions\": [ \"CÃ¡c cÃ¢u há»i tiá»n sá»­ cáº§n Ä‘Ã o sÃ¢u\" ],\n" +
                                                "  \"priorityFocus\": \"Æ¯u tiÃªn sá»‘ 1 trong ca khÃ¡m nÃ y\"\n" +
                                                "}",
                                medicalContext);
        }

        public String getLabInterpretationPrompt(String patientContext, String labResultsJson) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA PHÃ‚N TÃCH Káº¾T QUáº¢ XÃ‰T NGHIá»†M.\n" +
                                                "NHIá»†M Vá»¤: Giáº£i thÃ­ch káº¿t quáº£ xÃ©t nghiá»‡m cho bÃ¡c sÄ©, bao gá»“m Ã½ nghÄ©a lÃ¢m sÃ ng vÃ  Ä‘á» xuáº¥t tiáº¿p theo.\n\n"
                                                +
                                                "Bá»I Cáº¢NH Bá»†NH NHÃ‚N:\n%s\n\n" +
                                                "Káº¾T QUáº¢ XÃ‰T NGHIá»†M:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON (CHá»ˆ TRáº¢ Vá»€ JSON):\n" +
                                                "{\n" +
                                                "  \"overallAssessment\": \"ÄÃ¡nh giÃ¡ tá»•ng quan káº¿t quáº£ xÃ©t nghiá»‡m\",\n"
                                                +
                                                "  \"abnormalFindings\": [\n" +
                                                "    { \"testName\": \"...\", \"value\": \"...\", \"significance\": \"Ã nghÄ©a lÃ¢m sÃ ng\", \"possibleCauses\": [\"...\"] }\n"
                                                +
                                                "  ],\n" +
                                                "  \"correlations\": \"Má»‘i tÆ°Æ¡ng quan giá»¯a cÃ¡c chá»‰ sá»‘ báº¥t thÆ°á»ng\",\n" +
                                                "  \"followUpTests\": [ \"XÃ©t nghiá»‡m bá»• sung nÃªn chá»‰ Ä‘á»‹nh\" ],\n" +
                                                "  \"urgency\": \"ROUTINE|SOON|URGENT\"\n" +
                                                "}",
                                patientContext, labResultsJson);
        }

        public String getDischargeInstructionsPrompt(String patientContext) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA Y Táº¾ VIáº¾T HÆ¯á»šNG DáºªN XUáº¤T VIá»†N CHO Bá»†NH NHÃ‚N.\n" +
                                                "NHIá»†M Vá»¤: Táº¡o hÆ°á»›ng dáº«n xuáº¥t viá»‡n dá»… hiá»ƒu, rÃµ rÃ ng cho bá»‡nh nhÃ¢n vÃ  gia Ä‘Ã¬nh.\n\n"
                                                +
                                                "Bá»I Cáº¢NH LÃ‚M SÃ€NG:\n%s\n\n" +
                                                "YÃŠU Cáº¦U Ná»˜I DUNG:\n" +
                                                "1. TÃ³m táº¯t tÃ¬nh tráº¡ng hiá»‡n táº¡i (ngáº¯n gá»n, an tÃ¢m).\n" +
                                                "2. Lá»‹ch tÃ¡i khÃ¡m cá»¥ thá»ƒ.\n" +
                                                "3. HÆ°á»›ng dáº«n sá»­ dá»¥ng thuá»‘c (giá» uá»‘ng, lÆ°u Ã½ Ä‘áº·c biá»‡t).\n" +
                                                "4. Dáº¥u hiá»‡u cáº§n Ä‘áº¿n cáº¥p cá»©u NGAY.\n" +
                                                "5. Cháº¿ Ä‘á»™ Äƒn uá»‘ng, sinh hoáº¡t (náº¿u liÃªn quan).\n\n" +
                                                "PHONG CÃCH: Tiáº¿ng Viá»‡t Ä‘Æ¡n giáº£n, khÃ´ng dÃ¹ng thuáº­t ngá»¯ chuyÃªn mÃ´n. Font to, dá»… Ä‘á»c cho ngÆ°á»i cao tuá»•i.",
                                patientContext);
        }

        public String getFollowUpSuggestionPrompt(String context) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA ÄIá»€U PHá»I LÃ‚M SÃ€NG (CLINICAL COORDINATOR).\n" +
                                                "NHIá»†M Vá»¤: Dá»±a trÃªn tÃ¬nh tráº¡ng bá»‡nh mÃ£n tÃ­nh vÃ  sinh hiá»‡u hiá»‡n táº¡i, hÃ£y Ä‘á» xuáº¥t thá»i Ä‘iá»ƒm tÃ¡i khÃ¡m tá»‘i Æ°u.\n\n"
                                                +
                                                "Bá»I Cáº¢NH LÃ‚M SÃ€NG & Bá»†NH Ná»€N:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON (CHá»ˆ TRáº¢ Vá»€ JSON):\n" +
                                                "{\n" +
                                                "  \"suggestedInDays\": 30,\n" +
                                                "  \"reasoning\": \"PhÃ¢n tÃ­ch táº¡i sao chá»n thá»i Ä‘iá»ƒm nÃ y\",\n" +
                                                "  \"priority\": \"ROUTINE|SOON|URGENT\",\n" +
                                                "  \"clinicalGoals\": [ \"Má»¥c tiÃªu kiá»ƒm soÃ¡t trong láº§n tá»›i (vÃ­ dá»¥: Giáº£m HbA1c, á»•n Ä‘á»‹nh HA)\" ]\n"
                                                +
                                                "}",
                                context);
        }

        public String getTreatmentEfficacyPrompt(String context) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA PHÃ‚N TÃCH HIá»†U QUáº¢ ÄIá»€U TRá»Š (TREATMENT EFFICACY ANALYST).\n"
                                                +
                                                "NHIá»†M Vá»¤: PhÃ¢n tÃ­ch má»‘i quan há»‡ giá»¯a tuÃ¢n thá»§ thuá»‘c vÃ  chá»‰ sá»‘ sinh hiá»‡u Ä‘á»ƒ Ä‘Ã¡nh giÃ¡ hiá»‡u quáº£ phÃ¡c Ä‘á»“.\n\n"
                                                +
                                                "Dá»® LIá»†U LÃ‚M SÃ€NG:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON (CHá»ˆ TRáº¢ Vá»€ JSON):\n" +
                                                "{\n" +
                                                "  \"overallStatus\": \"IMPROVING|STABLE|DECLINING\",\n" +
                                                "  \"adherenceCorrelation\": 0.95,\n" +
                                                "  \"metricInsights\": [\n" +
                                                "    { \"metricName\": \"Huyáº¿t Ã¡p\", \"trend\": \"IMPROVING\", \"stability\": \"HIGH\", \"lastValue\": \"120/80\", \"message\": \"á»”n Ä‘á»‹nh trong ngÆ°á»¡ng má»¥c tiÃªu\" }\n"
                                                +
                                                "  ],\n" +
                                                "  \"aiAnalysis\": \"PhÃ¢n tÃ­ch chuyÃªn sÃ¢u vá» tÃ¡c Ä‘á»™ng cá»§a thuá»‘c Ä‘á»‘i vá»›i sinh hiá»‡u bá»‡nh nhÃ¢n\",\n"
                                                +
                                                "  \"recommendations\": [ \"Gá»£i Ã½ Ä‘iá»u chá»‰nh liá»u hoáº·c giá»¯ nguyÃªn phÃ¡c Ä‘á»“\" ]\n"
                                                +
                                                "}",
                                context);
        }

        public String getComplicationRiskPrompt(String context) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA Dá»° BÃO BIáº¾N CHá»¨NG (COMPLICATION RISK PREDICTOR).\n" +
                                                "NHIá»†M Vá»¤: PhÃ¢n tÃ­ch cháº©n Ä‘oÃ¡n, sinh hiá»‡u vÃ  má»©c Ä‘á»™ tuÃ¢n thá»§ Ä‘á»ƒ dá»± bÃ¡o nguy cÆ¡ biáº¿n chá»©ng cáº¥p tÃ­nh hoáº·c dÃ i háº¡n.\n\n"
                                                +
                                                "Dá»® LIá»†U LÃ‚M SÃ€NG & Lá»ŠCH Sá»¬:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON (CHá»ˆ TRáº¢ Vá»€ JSON):\n" +
                                                "{\n" +
                                                "  \"riskLevel\": \"LOW|MEDIUM|HIGH|CRITICAL\",\n" +
                                                "  \"riskScore\": 75.5,\n" +
                                                "  \"primaryRiskFactor\": \"Yáº¿u tá»‘ nguy cÆ¡ chÃ­nh (vÃ­ dá»¥: Huyáº¿t Ã¡p tÃ¢m thu khÃ´ng á»•n Ä‘á»‹nh)\",\n"
                                                +
                                                "  \"detailFactors\": [\n" +
                                                "    { \"factorName\": \"TÃªn yáº¿u tá»‘\", \"impact\": \"HIGH|MEDIUM|LOW\", \"description\": \"MÃ´ táº£ chi tiáº¿t táº¡i sao lÃ  nguy cÆ¡\" }\n"
                                                +
                                                "  ],\n" +
                                                "  \"aiWarning\": \"Lá»i cáº£nh bÃ¡o Ä‘anh thÃ©p tá»« AI vá» nguy cÆ¡ cÃ³ thá»ƒ xáº£y ra trong 30 ngÃ y tá»›i\",\n"
                                                +
                                                "  \"preventiveActions\": [ \"HÃ nh Ä‘á»™ng ngÄƒn ngá»«a kháº©n cáº¥p hoáº·c dÃ i háº¡n\" ]\n"
                                                +
                                                "}",
                                context);
        }

        public String getStandardizedNotePrompt(String context) {
                return String.format(
                                "SYSTEM: Báº N LÃ€ CHUYÃŠN GIA CHUáº¨N HÃ“A Há»’ SÆ  LÃ‚M SÃ€NG (CLINICAL DOCUMENTATION IMPROVEMENT SPECIALIST).\n"
                                                +
                                                "NHIá»†M Vá»¤: Chuyá»ƒn Ä‘á»•i cÃ¡c ghi chÃ©p rá»i ráº¡c thÃ nh há»“ sÆ¡ chuáº©n SOAP (Subjective, Objective, Assessment, Plan) phá»¥c vá»¥ thanh toÃ¡n báº£o hiá»ƒm.\n\n"
                                                +
                                                "Dá»® LIá»†U CA LÃ‚M SÃ€NG:\n%s\n\n" +
                                                "YÃŠU Cáº¦U JSON (CHá»ˆ TRáº¢ Vá»€ JSON):\n" +
                                                "{\n" +
                                                "  \"soapSubjective\": \"TÃ³m táº¯t lá»i khai bá»‡nh nhÃ¢n, triá»‡u chá»©ng cÆ¡ nÄƒng\",\n"
                                                +
                                                "  \"soapObjective\": \"TÃ³m táº¯t khÃ¡m thá»±c thá»ƒ, sinh hiá»‡u, cáº­n lÃ¢m sÃ ng\",\n"
                                                +
                                                "  \"soapAssessment\": \"Cháº©n Ä‘oÃ¡n xÃ¡c Ä‘á»‹nh, cháº©n Ä‘oÃ¡n phÃ¢n biá»‡t, diá»…n tiáº¿n\",\n"
                                                +
                                                "  \"soapPlan\": \"Káº¿ hoáº¡ch Ä‘iá»u trá»‹, thuá»‘c, dáº·n dÃ²\",\n" +
                                                "  \"suggestedCptCodes\": [ { \"code\": \"99213\", \"description\": \"Office visit for steady patient\" } ],\n"
                                                +
                                                "  \"suggestedIcd10Codes\": [ { \"code\": \"E11.9\", \"description\": \"Type 2 diabetes mellitus without complications\" } ],\n"
                                                +
                                                "  \"insuranceMemo\": \"LÆ°u Ã½ Ä‘áº·c biá»‡t cho tháº©m Ä‘á»‹nh viÃªn báº£o hiá»ƒm vá» tÃ­nh há»£p lÃ½ cá»§a chá»‰ Ä‘á»‹nh\"\n"
                                                +
                                                "}",
                                context);
        }
}

