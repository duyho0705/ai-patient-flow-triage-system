package vn.clinic.cdm.patient.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.clinic.cdm.api.dto.patient.PatientCrmInsightDto;
import vn.clinic.cdm.clinical.repository.ClinicalConsultationRepository;
import vn.clinic.cdm.clinical.repository.HealthMetricRepository;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.scheduling.repository.SchedulingAppointmentRepository;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientCrmService {

    private final ClinicalConsultationRepository consultationRepository;
    private final SchedulingAppointmentRepository appointmentRepository;
    private final HealthMetricRepository healthMetricRepository;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private ChatLanguageModel chatModel;

    public PatientCrmInsightDto getPatientInsight(Patient patient) {
        if (chatModel == null) {
            return fallbackInsight(patient);
        }

        try {
            var history = consultationRepository.findByPatientIdOrderByStartedAtDesc(patient.getId());
            var appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patient.getId());
            var vitals = healthMetricRepository.findByPatientIdOrderByRecordedAtDesc(patient.getId())
                    .stream().limit(5).collect(Collectors.toList());

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
                    vitals.stream().map(v -> v.getMetricType() + ":" + v.getValue())
                            .collect(Collectors.joining(", ")));

            String prompt = String.format(
                    "Báº¡n lÃ  'Enterprise Patient Retention & Clinical Engagement AI'. PhÃ¢n tÃ­ch dá»¯ liá»‡u bá»‡nh nhÃ¢n vÃ  tráº£ vá» JSON insight.\n\n"
                            +
                            "Dá»® LIá»†U:\n%s\n\n" +
                            "YÃŠU Cáº¦U JSON (Strict Only):\n" +
                            "{\n" +
                            "  \"healthScoreLabel\": \"STABLE|AT_RISK|CRITICAL_FOLLOWUP\",\n" +
                            "  \"adherenceScore\": 0.0-100.0,\n" +
                            "  \"careGaps\": [ { \"title\": \"...\", \"description\": \"...\", \"urgency\": \"HIGH|MEDIUM|LOW\", \"recommendation\": \"...\" } ],\n"
                            +
                            "  \"retentionRisk\": \"LOW|MEDIUM|HIGH\",\n" +
                            "  \"nextBestAction\": \"HÃ nh Ä‘á»™ng tá»‘i Æ°u tiáº¿p theo (vÃ­ dá»¥: Gá»i Ä‘iá»‡n nháº¯c tÃ¡i khÃ¡m)\",\n" +
                            "  \"aiSummary\": \"TÃ³m táº¯t tÃ¬nh tráº¡ng gáº¯n káº¿t (1 cÃ¢u)\"\n" +
                            "}\n\n" +
                            "LÆ°u Ã½: Náº¿u bá»‡nh nhÃ¢n cÃ³ nhiá»u lá»‹ch háº¹n bá»‹ há»§y hoáº·c chá»‰ sá»‘ sinh hiá»‡u khÃ´ng á»•n Ä‘á»‹nh, hÃ£y tÄƒng má»©c Ä‘á»™ rá»§i ro.",
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
                .aiSummary("Dá»¯ liá»‡u Ä‘ang Ä‘Æ°á»£c cáº­p nháº­t.")
                .build();
    }
}

