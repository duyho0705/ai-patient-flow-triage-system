package vn.clinic.cdm.service.clinical.impl;

import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.entity.clinical.HealthMetric;
import vn.clinic.cdm.entity.patient.Patient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiClinicalAnalysisServiceImpl implements vn.clinic.cdm.service.clinical.AiClinicalAnalysisService {

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    @Override
    public String analyzePatientHealth(Patient patient, List<HealthMetric> metrics) {
        if (chatModel == null) {
            return "AI Analysis is currently unavailable. Please check system configuration.";
        }

        String context = buildPatientSummary(patient, metrics);
        String prompt = "Bạn là bác sĩ AI chuyên nghiệp. Hãy phân tích các chỉ số sức khỏe sau và đưa ra đánh giá rủi ro (Thấp, Trung bình, Cao) kèm theo lời khuyên chuyên môn:\n\n"
                + context + "\n\n"
                + "Yêu cầu:\n"
                + "1. Trả lời bằng tiếng Việt.\n"
                + "2. Tập trung vào các bất thường.\n"
                + "3. Đưa ra các bước tiếp theo cho bác sĩ điều trị.";

        try {
            return chatModel.chat(prompt);
        } catch (Exception e) {
            log.error("AI Analysis failed: {}", e.getMessage());
            return "Lỗi khi phân tích bằng AI: " + e.getMessage();
        }
    }

    private String buildPatientSummary(Patient p, List<HealthMetric> metrics) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bệnh nhân: ").append(p.getFullNameVi()).append("\n");
        sb.append("Giới tính: ").append(p.getGender()).append("\n");
        sb.append("Chỉ số gần đây:\n");
        metrics.stream().limit(10).forEach(m -> {
            sb.append("- ").append(m.getMetricType()).append(": ")
                    .append(m.getValue()).append(" ").append(m.getUnit())
                    .append(" (").append(m.getRecordedAt()).append(")\n");
        });
        return sb.toString();
    }
}
