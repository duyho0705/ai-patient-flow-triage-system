package vn.clinic.patientflow.patient.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.clinic.patientflow.api.dto.PatientCrmInsightDto;
import vn.clinic.patientflow.clinical.repository.ClinicalConsultationRepository;
import vn.clinic.patientflow.patient.domain.Patient;
import vn.clinic.patientflow.scheduling.repository.SchedulingAppointmentRepository;
import vn.clinic.patientflow.triage.repository.TriageVitalRepository;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientCrmService {

    private final ClinicalConsultationRepository consultationRepository;
    private final SchedulingAppointmentRepository appointmentRepository;
    private final TriageVitalRepository vitalsRepository;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    public PatientCrmInsightDto getPatientInsight(Patient patient) {
        if (chatModel == null) {
            return fallbackInsight(patient);
        }

        try {
            // Build a multi-dimensional view of the patient
            var history = consultationRepository.findByPatientIdOrderByStartedAtDesc(patient.getId());
            var appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patient.getId());
            var vitals = vitalsRepository.findTop5ByPatientIdOrderByRecordedAtDesc(patient.getId());

            String context = String.format(
                    "PATIENT: %s (DOB: %s, Gender: %s)\n" +
                            "LAST VISIT: %s\n" +
                            "APPOINTMENT HISTORY: %d total, %d cancelled\n" +
                            "LAST VITALS: %s\n",
                    patient.getFullNameVi(),
                    patient.getDateOfBirth(),
                    patient.getGender(),
                    history.isEmpty() ? "None" : history.get(0).getStartedAt(),
                    appointments.size(),
                    appointments.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count(),
                    vitals.stream().map(v -> v.getVitalType() + ":" + v.getValueNumeric())
                            .collect(Collectors.joining(", ")));

            String prompt = String.format(
                    "Bạn là 'Enterprise Patient Retention & Clinical Engagement AI'. Phân tích dữ liệu bệnh nhân và trả về JSON insight.\n\n"
                            +
                            "DỮ LIỆU:\n%s\n\n" +
                            "YÊU CẦU JSON (Strict Only):\n" +
                            "{\n" +
                            "  \"healthScoreLabel\": \"STABLE|AT_RISK|CRITICAL_FOLLOWUP\",\n" +
                            "  \"adherenceScore\": 0.0-100.0,\n" +
                            "  \"careGaps\": [ { \"title\": \"...\", \"description\": \"...\", \"urgency\": \"HIGH|MEDIUM|LOW\", \"recommendation\": \"...\" } ],\n"
                            +
                            "  \"retentionRisk\": \"LOW|MEDIUM|HIGH\",\n" +
                            "  \"nextBestAction\": \"Hành động tối ưu tiếp theo (ví dụ: Gọi điện nhắc tái khám)\",\n" +
                            "  \"aiSummary\": \"Tóm tắt tình trạng gắn kết (1 câu)\"\n" +
                            "}\n\n" +
                            "Lưu ý: Nếu bệnh nhân có nhiều lịch hẹn bị hủy hoặc chỉ số sinh hiệu không ổn định, hãy tăng mức độ rủi ro.",
                    context);

            String response = chatModel.chat(prompt);
            return parseJson(response);

        } catch (Exception e) {
            log.error("Patient CRM AI Error: {}", e.getMessage());
            return fallbackInsight(patient);
        }
    }

    private PatientCrmInsightDto parseJson(String aiResponse) {
        try {
            String jsonPart = aiResponse;
            if (aiResponse.contains("{")) {
                jsonPart = aiResponse.substring(aiResponse.indexOf("{"), aiResponse.lastIndexOf("}") + 1);
            }
            return objectMapper.readValue(jsonPart, PatientCrmInsightDto.class);
        } catch (Exception e) {
            log.error("Failed to parse Patient CRM JSON: {}", e.getMessage());
            return null;
        }
    }

    private PatientCrmInsightDto fallbackInsight(Patient patient) {
        return PatientCrmInsightDto.builder()
                .healthScoreLabel("UNKNOWN")
                .retentionRisk("LOW")
                .aiSummary("Dữ liệu đang được cập nhật.")
                .build();
    }
}
