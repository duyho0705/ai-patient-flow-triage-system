package vn.clinic.patientflow.clinical.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import vn.clinic.patientflow.api.dto.ConsultationSummaryPdfDto;
import vn.clinic.patientflow.api.dto.LabResultDto;
import vn.clinic.patientflow.clinical.domain.ClinicalConsultation;
import vn.clinic.patientflow.clinical.domain.ClinicalVital;
import vn.clinic.patientflow.clinical.domain.DiagnosticImage;
import vn.clinic.patientflow.clinical.domain.LabResult;
import vn.clinic.patientflow.clinical.domain.Prescription;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Enterprise Clinical Mapper.
 * Responsibility: Transforming Domain Entities into DTOs for
 * Presentation/Export.
 */
@Component
@RequiredArgsConstructor
public class ClinicalMapper {

    public ConsultationSummaryPdfDto toPdfDto(
            ClinicalConsultation cons,
            List<ClinicalVital> vitals,
            List<LabResult> labs,
            List<DiagnosticImage> images,
            Prescription prescription,
            vn.clinic.patientflow.api.dto.PrescriptionDto prescriptionDto) {

        var builder = ConsultationSummaryPdfDto.builder()
                .consultationId(cons.getId())
                .patientName(cons.getPatient().getFullNameVi())
                .doctorName(cons.getDoctorUser() != null ? cons.getDoctorUser().getFullNameVi() : "N/A")
                .consultationDate(cons.getStartedAt())
                .diagnosis(cons.getDiagnosisNotes())
                .clinicalNotes(cons.getPrescriptionNotes())
                .chiefComplaint(cons.getChiefComplaintSummary());

        if (cons.getPatient().getDateOfBirth() != null) {
            builder.patientDob(cons.getPatient().getDateOfBirth().toString());
        }
        builder.patientGender(cons.getPatient().getGender() != null ? cons.getPatient().getGender() : "N/A");

        // Vitals
        builder.vitals(vitals.stream()
                .map(v -> ConsultationSummaryPdfDto.VitalDto.builder()
                        .type(v.getVitalType())
                        .value(v.getValueNumeric() != null ? v.getValueNumeric().toString() : "N/A")
                        .unit(v.getUnit())
                        .build())
                .collect(Collectors.toList()));

        // Labs
        builder.labResults(labs.stream().map(l -> LabResultDto.builder()
                .testName(l.getTestName())
                .value(l.getValue())
                .unit(l.getUnit())
                .referenceRange(l.getReferenceRange())
                .status(l.getStatus())
                .build()).collect(Collectors.toList()));

        // Imaging
        builder.imagingResults(images.stream()
                .map(img -> ConsultationSummaryPdfDto.ImagingDto.builder()
                        .title(img.getTitle())
                        .description(img.getDescription())
                        .build())
                .collect(Collectors.toList()));

        // Prescription
        if (prescriptionDto != null) {
            builder.prescriptionItems(prescriptionDto.getItems());
            builder.prescriptionNotes(prescriptionDto.getNotes());
        }

        return builder.build();
    }
}
