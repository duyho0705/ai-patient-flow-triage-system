package vn.clinic.patientflow.api.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;

@Data
@Builder
public class ConsultationDto {
        private UUID id;
        private UUID patientId;
        private String patientName;
        private UUID doctorUserId;
        private String doctorName;
        private String status;
        private Instant startedAt;
        private Instant endedAt;
        private String diagnosisNotes;
        private String prescriptionNotes;
        private String aiInsights;

        private UUID appointmentId;
        private String chiefComplaintSummary;

        public static ConsultationDto fromEntity(ClinicalConsultation entity) {
                return ConsultationDto.builder()
                                .id(entity.getId())
                                .patientId(entity.getPatient().getId())
                                .patientName(entity.getPatient().getFullNameVi())
                                .appointmentId(entity.getAppointment() != null ? entity.getAppointment().getId() : null)
                                .chiefComplaintSummary(entity.getChiefComplaintSummary())
                                .doctorUserId(entity.getDoctorUser() != null ? entity.getDoctorUser().getId() : null)
                                .doctorName(entity.getDoctorUser() != null ? entity.getDoctorUser().getFullNameVi()
                                                : null)
                                .status(entity.getStatus())
                                .startedAt(entity.getStartedAt())
                                .endedAt(entity.getEndedAt())
                                .diagnosisNotes(entity.getDiagnosisNotes())
                                .prescriptionNotes(entity.getPrescriptionNotes())
                                .aiInsights(entity.getAiInsights())
                                .build();
        }
}
