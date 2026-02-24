package vn.clinic.patientflow.clinical.service;

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
                                "SYSTEM: BẠN LÀ HỆ THỐNG HỖ TRỢ QUYẾT ĐỊNH LÂM SÀNG (CDS) DOANH NGHIỆP.\n" +
                                                "GUIDELINE: Bộ Y Tế Việt Nam & WHO.\n\n" +
                                                "CONTEXT BỆNH NHÂN:\n%s\n\n" +
                                                "NHIỆM VỤ:\n" +
                                                "1. Phân tích các chỉ số bất thường nguy cấp.\n" +
                                                "2. Đề xuất các rủi ro tương tác hoặc chống chỉ định.\n" +
                                                "3. Gợi ý chẩn đoán phân biệt dựa trên triệu chứng.\n\n" +
                                                "OUTPUT FORMAT (STRICT JSON ONLY):\n" +
                                                "{\n" +
                                                "  \"riskLevel\": \"LOW|MEDIUM|HIGH|CRITICAL\",\n" +
                                                "  \"summary\": \"Tóm tắt lâm sàng\",\n" +
                                                "  \"warnings\": [ { \"type\": \"INTERACTION|VITAL_ALARM\", \"message\": \"...\", \"severity\": \"ERROR|WARNING\" } ],\n"
                                                +
                                                "  \"suggestions\": [ { \"title\": \"...\", \"reason\": \"...\", \"actionType\": \"LAB_ORDER|IMAGING\" } ],\n"
                                                +
                                                "  \"differentialDiagnoses\": [ \"ICD-10 Code\" ],\n" +
                                                "  \"aiReasoning\": \"Phân tích chuyên sâu (Professional Clinical Reasoning)\"\n"
                                                +
                                                "}\n",
                                context);
        }

        public String getClinicalSupportPrompt(String context) {
                return String.format(
                                "SYSTEM: AI CLINICAL ASSISTANT.\n\n" +
                                                "DỮ LIỆU LÂM SÀNG:\n%s\n\n" +
                                                "YÊU CẦU: Phân tích kỹ lưỡng và đưa ra tóm tắt bệnh án, đánh giá sinh hiệu, gợi ý chẩn đoán ICD-10 và cảnh báo rủi ro.",
                                context);
        }

        public String getEarlyWarningPrompt(String patientData, String vitalHistory) {
                return String.format(
                                "SYSTEM: BẠN LÀ 'ENTERPRISE CLINICAL DETERIORATION MONITORING SYSTEM'.\n" +
                                                "NHIỆM VỤ: Phân tích sinh hiệu bệnh nhân và trả về cảnh báo lâm sàng (NEWS2-based).\n\n"
                                                +
                                                "DỮ LIỆU BỆNH NHÂN:\n%s\n%s\n\n" +
                                                "YÊU CẦU JSON (CHỈ TRẢ VỀ JSON):\n" +
                                                "{\n" +
                                                "  \"news2Score\": 0,\n" +
                                                "  \"riskLevel\": \"LOW|MEDIUM|HIGH\",\n" +
                                                "  \"monitoringFrequency\": \"Tần suất theo dõi đề xuất\",\n" +
                                                "  \"warnings\": [ { \"vitalType\": \"...\", \"value\": \"...\", \"pointsContributed\": 0, \"trend\": \"STABLE|WORSENING|IMPROVING\" } ],\n"
                                                +
                                                "  \"aiClinicalAssessment\": \"Đánh giá nguy cơ diễn tiến nặng\",\n" +
                                                "  \"escalationProtocol\": \"Quy trình xử lý khẩn cấp\"\n" +
                                                "}",
                                patientData, vitalHistory);
        }

        public String getClinicalChatPrompt(String context, String userMessage, String history) {
                return String.format(
                                "SYSTEM: BẠN LÀ AI CLINICAL ASSISTANT ĐANG HỖ TRỢ TRỰC TIẾP CHO BÁC SĨ.\n\n" +
                                                "BỐI CẢNH LÂM SÀNG:\n%s\n\n" +
                                                "LỊCH SỬ HỘI THOẠI:\n%s\n\n" +
                                                "CÂU HỎI MỚI: %s\n\n" +
                                                "YÊU CẦU: Trả lời ngắn gọn, chuyên môn cao, dựa trên dữ liệu bệnh nhân.",
                                context, history, userMessage);
        }

        public String getCarePlanPrompt(String context) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA HOẠCH ĐỊNH CHĂM SÓC SỨC KHỎE CÁ NHÂN HÓA (CDM SPECIALIST).\n\n"
                                                +
                                                "DỮ LIỆU LÂM SÀNG & BỆNH NỀN:\n%s\n\n" +
                                                "NHIỆM VỤ: Tạo kế hoạch chăm sóc và điều trị dài hạn.\n" +
                                                "YÊU CẦU CHI TIẾT:\n" +
                                                "1. Đối soát sinh hiệu với ngưỡng mục tiêu cá nhân (nếu có).\n" +
                                                "2. Đánh giá tuân thủ thuốc: Nếu Adherence Score < 80%%, phải đưa ra giải pháp nhắc nhở hoặc giáo dục sức khỏe.\n"
                                                +
                                                "3. Kế hoạch ăn uống, tập luyện chuyên biệt cho loại bệnh mãn tính (Tiểu đường, Cao huyết áp, v.v.).\n"
                                                +
                                                "4. Dấu hiệu trở nặng (Exacerbation) cần nhập viện khẩn cấp.\n\n" +
                                                "FORMAT: Markdown professional (Vietnamese).\n" +
                                                "PHONG CÁCH: Thấu hiểu, khoa học, thực thi được (Actionable).",
                                context);
        }

        public String getPrescriptionVerifyPrompt(String patientData, String prescriptionData) {
                return String.format(
                                "SYSTEM: CHUYÊN GIA DƯỢC LÂM SÀNG DOANH NGHIỆP.\n\n" +
                                                "BỐI CẢNH BỆNH NHÂN:\n%s\n\n" +
                                                "NỘI DUNG ĐƠN THUỐC:\n%s\n\n" +
                                                "NHIỆM VỤ:\n" +
                                                "1. Kiểm tra tương tác thuốc, chống chỉ định, dị ứng.\n" +
                                                "2. Đánh giá liều lượng dựa trên cân nặng/tuổi/vitals.\n" +
                                                "3. Gợi ý tối ưu hóa (ví dụ: dùng thuốc generic tương đương để giảm chi phí).\n\n"
                                                +
                                                "OUTPUT FORMAT (STRICT JSON ONLY):\n" +
                                                "{\n" +
                                                "  \"status\": \"SAFE|WARNING|DANGEROUS\",\n" +
                                                "  \"summary\": \"Tóm tắt đánh giá\",\n" +
                                                "  \"warnings\": [ { \"type\": \"INTERACTION|ALLERGY|DOSAGE\", \"message\": \"...\", \"severity\": \"INFO|WARNING|CRITICAL\" } ],\n"
                                                +
                                                "  \"suggestions\": [ { \"originalMedication\": \"...\", \"suggestedAlternative\": \"...\", \"reason\": \"COST_SAVING|EFFICACY\" } ],\n"
                                                +
                                                "  \"aiReasoning\": \"Phân tích chuyên môn sâu\"\n" +
                                                "}",
                                patientData, prescriptionData);
        }

        public String getPatientHistorySummaryPrompt(String patientName, String historyJson) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA TÓM TẮT HỒ SƠ BỆNH ÁN.\n" +
                                                "NHIỆM VỤ: Tóm tắt ngắn gọn nhưng đầy đủ các điểm quan trọng trong lịch sử khám của bệnh nhân.\n\n"
                                                +
                                                "BỆNH NHÂN: %s\n" +
                                                "LỊCH SỬ KHÁM:\n%s\n\n" +
                                                "YÊU CẦU: Chia thành các mục (Chẩn đoán gần đây, Thuốc đang dùng, Lưu ý đặc biệt).",
                                patientName, historyJson);
        }

        public String getSuggestTemplatesPrompt(String context, String templatesJson) {
                return String.format(
                                "SYSTEM: BẠN LÀ CỐ VẤN LÂM SÀNG.\n" +
                                                "NHIỆM VỤ: Dựa trên chẩn đoán hiện tại, hãy gợi ý phác đồ/mẫu đơn thuốc phù hợp nhất từ danh sách mẫu có sẵn.\n\n"
                                                +
                                                "BỐI CẢNH HIỆN TẠI:\n%s\n\n" +
                                                "DANH SÁCH MẪU:\n%s\n\n" +
                                                "YÊU CẦU: Chỉ ra tại sao mẫu đó lại phù hợp.",
                                context, templatesJson);
        }

        public String getOperationalInsightsPrompt(String context) {
                return String.format(
                                "SYSTEM: BẠN LÀ 'ENTERPRISE CLINIC OPERATIONAL CONSULTANT'.\n" +
                                                "NHIỆM VỤ: Phân tích bộ dữ liệu vận hành và trả về kết quả dưới dạng JSON.\n\n"
                                                +
                                                "DỮ LIỆU VẬN HÀNH:\n%s\n\n" +
                                                "YÊU CẦU JSON (CHỈ TRẢ VỀ JSON):\n" +
                                                "{\n" +
                                                "  \"executiveSummary\": \"Tóm tắt (2-3 câu)\",\n" +
                                                "  \"metrics\": [ { \"name\": \"...\", \"value\": \"...\", \"status\": \"IMPROVING|DECLINING|STABLE\", \"insight\": \"...\" } ],\n"
                                                +
                                                "  \"recommendations\": [ { \"title\": \"...\", \"description\": \"...\", \"priority\": \"HIGH|MEDIUM|LOW\", \"impact\": \"...\" } ],\n"
                                                +
                                                "  \"forecasts\": [ { \"date\": \"...\", \"predictedVolume\": 0, \"predictedRevenue\": 0, \"confidence\": \"HI|MED|LO\" } ],\n"
                                                +
                                                "  \"leakageAlerts\": [ { \"patientId\": \"...\", \"patientName\": \"...\", \"missingType\": \"NO_INVOICE|UNPAID_RX\", \"potentialValue\": \"...\", \"details\": \"...\" } ],\n"
                                                +
                                                "  \"riskAssessment\": \"Đánh giá rủi ro vận hành\"\n" +
                                                "}",
                                context);
        }

        public String getIcd10CodingPrompt(String diagnosisNotes) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA MÃ HÓA BỆNH TẬT (ICD-10 CODER).\n" +
                                                "NHIỆM VỤ: Dựa trên ghi chú chẩn đoán của bác sĩ, hãy tìm mã ICD-10 phù hợp nhất.\n\n"
                                                +
                                                "GHI CHÚ CHẨN ĐOÁN: %s\n\n" +
                                                "YÊU CẦU JSON (CHỈ TRẢ VỀ JSON):\n" +
                                                "{\n" +
                                                "  \"primaryCode\": \"Mã ICD-10 chính (Ví dụ: E11.9)\",\n" +
                                                "  \"description\": \"Tên bệnh tiếng Việt theo Bộ Y Tế\",\n" +
                                                "  \"confidence\": 0.0-1.0,\n" +
                                                "  \"alternativeCodes\": [ {\"code\": \"...\", \"description\": \"...\"} ]\n"
                                                +
                                                "}",
                                diagnosisNotes);
        }

        public String getPatientHealthSummaryPrompt(String patientName, String medicalDataJson) {
                return String.format(
                                "SYSTEM: BẠN LÀ TRỢ LÝ Y TẾ AI CAO CẤP.\n" +
                                                "NHIỆM VỤ: Tổng hợp hồ sơ sức khỏe của bệnh nhân thành một báo cáo chuyên nghiệp, dễ hiểu.\n\n"
                                                +
                                                "BỆNH NHÂN: %s\n" +
                                                "DỮ LIỆU Y TẾ:\n%s\n\n" +
                                                "YÊU CẦU NỘI DUNG:\n" +
                                                "1. Tình trạng chung: Tóm tắt ngắn gọn.\n" +
                                                "2. Chỉ số sinh hiệu: Đánh giá các chỉ số gần nhất (Huyết áp, SpO2, v.v.).\n"
                                                +
                                                "3. Lịch sử bệnh lý: Các chẩn đoán quan trọng gần đây.\n" +
                                                "4. Khuyến nghị Lifestyle: Tư vấn sức khỏe cá nhân hóa.\n" +
                                                "5. Cảnh báo (nếu có): Các dấu hiệu cần tái khám ngay.\n\n" +
                                                "PHONG CÁCH: Chuyên nghiệp, an tâm, tiếng Việt chuẩn y khoa.",
                                patientName, medicalDataJson);
        }

        public String getPharmacyDrugSearchPrompt(String query) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA DƯỢC LÂM SÀNG.\n" +
                                                "NHIỆM VỤ: Cung cấp thông tin chi tiết về thuốc dựa trên truy vấn.\n\n"
                                                +
                                                "TRUY VẤN: %s\n\n" +
                                                "YÊU CẦU NỘI DUNG:\n" +
                                                "1. Thành phần hoạt chất.\n" +
                                                "2. Chỉ định & Liều dùng thông thường.\n" +
                                                "3. Chống chỉ định quan trọng.\n" +
                                                "4. Lưu ý khi cấp phát (ví dụ: uống lúc đói/no).\n\n" +
                                                "PHONG CÁCH: Chính xác, súc tích, theo dược điển.",
                                query);
        }

        public String getPharmacyInteractionCheckPrompt(String drugsList) {
                return String.format(
                                "SYSTEM: BẠN LÀ HỆ THỐNG KIỂM TRA TƯƠNG TÁC THUỐC.\n" +
                                                "NHIỆM VỤ: Phân tích tương tác giữa các loại thuốc trong danh sách.\n\n"
                                                +
                                                "DANH SÁCH THUỐC:\n%s\n\n" +
                                                "YÊU CẦU JSON:\n" +
                                                "{\n" +
                                                "  \"severity\": \"LOW/MEDIUM/HIGH/CONTRAINDICATED\",\n" +
                                                "  \"summary\": \"Tóm tắt tương tác\",\n" +
                                                "  \"details\": \"Chi tiết cơ chế (nếu có)\",\n" +
                                                "  \"recommendation\": \"Lời khuyên cho dược sĩ\"\n" +
                                                "}",
                                drugsList);
        }

        public String getDifferentialDiagnosisPrompt(String clinicalContext) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA CHẨN ĐOÁN LÂM SÀNG.\n" +
                                                "NHIỆM VỤ: Dựa trên bối cảnh hiện tại, hãy gợi ý danh sách chẩn đoán phân biệt (Differential Diagnosis).\n\n"
                                                +
                                                "BỐI CẢNH LÂM SÀNG:\n%s\n\n" +
                                                "YÊU CẦU JSON:\n" +
                                                "{\n" +
                                                "  \"primaryDiagnosis\": \"Chẩn đoán khả thi nhất\",\n" +
                                                "  \"differentials\": [\n" +
                                                "    { \"disease\": \"Tên bệnh\", \"probability\": \"Cao/Trung bình/Thấp\", \"reasoning\": \"Tại sao nghĩ đến bệnh này\", \"tests\": \"Xét nghiệm gợi ý\" }\n"
                                                +
                                                "  ],\n" +
                                                "  \"redFlags\": [ \"Các dấu hiệu nguy hiểm cần loại trừ ngay\" ]\n" +
                                                "}",
                                clinicalContext);
        }

        public String getClinicalChecklistPrompt(String medicalContext) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA HƯỚNG DẪN THĂM KHÁM LÂM SÀNG.\n" +
                                                "NHIỆM VỤ: Dựa trên tình trạng bệnh nhân, hãy gợi ý các đầu mục bác sĩ cần kiểm tra kỹ.\n\n"
                                                +
                                                "BỐI CẢNH LÂM SÀNG:\n%s\n\n" +
                                                "YÊU CẦU JSON:\n" +
                                                "{\n" +
                                                "  \"physicalExams\": [ \"Các mục cần khám thể chất (ví dụ: Nghe phổi, sờ bụng)\" ],\n"
                                                +
                                                "  \"historyQuestions\": [ \"Các câu hỏi tiền sử cần đào sâu\" ],\n" +
                                                "  \"priorityFocus\": \"Ưu tiên số 1 trong ca khám này\"\n" +
                                                "}",
                                medicalContext);
        }

        public String getLabInterpretationPrompt(String patientContext, String labResultsJson) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA PHÂN TÍCH KẾT QUẢ XÉT NGHIỆM.\n" +
                                                "NHIỆM VỤ: Giải thích kết quả xét nghiệm cho bác sĩ, bao gồm ý nghĩa lâm sàng và đề xuất tiếp theo.\n\n"
                                                +
                                                "BỐI CẢNH BỆNH NHÂN:\n%s\n\n" +
                                                "KẾT QUẢ XÉT NGHIỆM:\n%s\n\n" +
                                                "YÊU CẦU JSON (CHỈ TRẢ VỀ JSON):\n" +
                                                "{\n" +
                                                "  \"overallAssessment\": \"Đánh giá tổng quan kết quả xét nghiệm\",\n"
                                                +
                                                "  \"abnormalFindings\": [\n" +
                                                "    { \"testName\": \"...\", \"value\": \"...\", \"significance\": \"Ý nghĩa lâm sàng\", \"possibleCauses\": [\"...\"] }\n"
                                                +
                                                "  ],\n" +
                                                "  \"correlations\": \"Mối tương quan giữa các chỉ số bất thường\",\n" +
                                                "  \"followUpTests\": [ \"Xét nghiệm bổ sung nên chỉ định\" ],\n" +
                                                "  \"urgency\": \"ROUTINE|SOON|URGENT\"\n" +
                                                "}",
                                patientContext, labResultsJson);
        }

        public String getDischargeInstructionsPrompt(String patientContext) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA Y TẾ VIẾT HƯỚNG DẪN XUẤT VIỆN CHO BỆNH NHÂN.\n" +
                                                "NHIỆM VỤ: Tạo hướng dẫn xuất viện dễ hiểu, rõ ràng cho bệnh nhân và gia đình.\n\n"
                                                +
                                                "BỐI CẢNH LÂM SÀNG:\n%s\n\n" +
                                                "YÊU CẦU NỘI DUNG:\n" +
                                                "1. Tóm tắt tình trạng hiện tại (ngắn gọn, an tâm).\n" +
                                                "2. Lịch tái khám cụ thể.\n" +
                                                "3. Hướng dẫn sử dụng thuốc (giờ uống, lưu ý đặc biệt).\n" +
                                                "4. Dấu hiệu cần đến cấp cứu NGAY.\n" +
                                                "5. Chế độ ăn uống, sinh hoạt (nếu liên quan).\n\n" +
                                                "PHONG CÁCH: Tiếng Việt đơn giản, không dùng thuật ngữ chuyên môn. Font to, dễ đọc cho người cao tuổi.",
                                patientContext);
        }

        public String getFollowUpSuggestionPrompt(String context) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA ĐIỀU PHỐI LÂM SÀNG (CLINICAL COORDINATOR).\n" +
                                                "NHIỆM VỤ: Dựa trên tình trạng bệnh mãn tính và sinh hiệu hiện tại, hãy đề xuất thời điểm tái khám tối ưu.\n\n"
                                                +
                                                "BỐI CẢNH LÂM SÀNG & BỆNH NỀN:\n%s\n\n" +
                                                "YÊU CẦU JSON (CHỈ TRẢ VỀ JSON):\n" +
                                                "{\n" +
                                                "  \"suggestedInDays\": 30,\n" +
                                                "  \"reasoning\": \"Phân tích tại sao chọn thời điểm này\",\n" +
                                                "  \"priority\": \"ROUTINE|SOON|URGENT\",\n" +
                                                "  \"clinicalGoals\": [ \"Mục tiêu kiểm soát trong lần tới (ví dụ: Giảm HbA1c, ổn định HA)\" ]\n"
                                                +
                                                "}",
                                context);
        }

        public String getTreatmentEfficacyPrompt(String context) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA PHÂN TÍCH HIỆU QUẢ ĐIỀU TRỊ (TREATMENT EFFICACY ANALYST).\n"
                                                +
                                                "NHIỆM VỤ: Phân tích mối quan hệ giữa tuân thủ thuốc và chỉ số sinh hiệu để đánh giá hiệu quả phác đồ.\n\n"
                                                +
                                                "DỮ LIỆU LÂM SÀNG:\n%s\n\n" +
                                                "YÊU CẦU JSON (CHỈ TRẢ VỀ JSON):\n" +
                                                "{\n" +
                                                "  \"overallStatus\": \"IMPROVING|STABLE|DECLINING\",\n" +
                                                "  \"adherenceCorrelation\": 0.95,\n" +
                                                "  \"metricInsights\": [\n" +
                                                "    { \"metricName\": \"Huyết áp\", \"trend\": \"IMPROVING\", \"stability\": \"HIGH\", \"lastValue\": \"120/80\", \"message\": \"Ổn định trong ngưỡng mục tiêu\" }\n"
                                                +
                                                "  ],\n" +
                                                "  \"aiAnalysis\": \"Phân tích chuyên sâu về tác động của thuốc đối với sinh hiệu bệnh nhân\",\n"
                                                +
                                                "  \"recommendations\": [ \"Gợi ý điều chỉnh liều hoặc giữ nguyên phác đồ\" ]\n"
                                                +
                                                "}",
                                context);
        }

        public String getComplicationRiskPrompt(String context) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA DỰ BÁO BIẾN CHỨNG (COMPLICATION RISK PREDICTOR).\n" +
                                                "NHIỆM VỤ: Phân tích chẩn đoán, sinh hiệu và mức độ tuân thủ để dự báo nguy cơ biến chứng cấp tính hoặc dài hạn.\n\n"
                                                +
                                                "DỮ LIỆU LÂM SÀNG & LỊCH SỬ:\n%s\n\n" +
                                                "YÊU CẦU JSON (CHỈ TRẢ VỀ JSON):\n" +
                                                "{\n" +
                                                "  \"riskLevel\": \"LOW|MEDIUM|HIGH|CRITICAL\",\n" +
                                                "  \"riskScore\": 75.5,\n" +
                                                "  \"primaryRiskFactor\": \"Yếu tố nguy cơ chính (ví dụ: Huyết áp tâm thu không ổn định)\",\n"
                                                +
                                                "  \"detailFactors\": [\n" +
                                                "    { \"factorName\": \"Tên yếu tố\", \"impact\": \"HIGH|MEDIUM|LOW\", \"description\": \"Mô tả chi tiết tại sao là nguy cơ\" }\n"
                                                +
                                                "  ],\n" +
                                                "  \"aiWarning\": \"Lời cảnh báo đanh thép từ AI về nguy cơ có thể xảy ra trong 30 ngày tới\",\n"
                                                +
                                                "  \"preventiveActions\": [ \"Hành động ngăn ngừa khẩn cấp hoặc dài hạn\" ]\n"
                                                +
                                                "}",
                                context);
        }

        public String getStandardizedNotePrompt(String context) {
                return String.format(
                                "SYSTEM: BẠN LÀ CHUYÊN GIA CHUẨN HÓA HỒ SƠ LÂM SÀNG (CLINICAL DOCUMENTATION IMPROVEMENT SPECIALIST).\n"
                                                +
                                                "NHIỆM VỤ: Chuyển đổi các ghi chép rời rạc thành hồ sơ chuẩn SOAP (Subjective, Objective, Assessment, Plan) phục vụ thanh toán bảo hiểm.\n\n"
                                                +
                                                "DỮ LIỆU CA LÂM SÀNG:\n%s\n\n" +
                                                "YÊU CẦU JSON (CHỈ TRẢ VỀ JSON):\n" +
                                                "{\n" +
                                                "  \"soapSubjective\": \"Tóm tắt lời khai bệnh nhân, triệu chứng cơ năng\",\n"
                                                +
                                                "  \"soapObjective\": \"Tóm tắt khám thực thể, sinh hiệu, cận lâm sàng\",\n"
                                                +
                                                "  \"soapAssessment\": \"Chẩn đoán xác định, chẩn đoán phân biệt, diễn tiến\",\n"
                                                +
                                                "  \"soapPlan\": \"Kế hoạch điều trị, thuốc, dặn dò\",\n" +
                                                "  \"suggestedCptCodes\": [ { \"code\": \"99213\", \"description\": \"Office visit for steady patient\" } ],\n"
                                                +
                                                "  \"suggestedIcd10Codes\": [ { \"code\": \"E11.9\", \"description\": \"Type 2 diabetes mellitus without complications\" } ],\n"
                                                +
                                                "  \"insuranceMemo\": \"Lưu ý đặc biệt cho thẩm định viên bảo hiểm về tính hợp lý của chỉ định\"\n"
                                                +
                                                "}",
                                context);
        }
}
