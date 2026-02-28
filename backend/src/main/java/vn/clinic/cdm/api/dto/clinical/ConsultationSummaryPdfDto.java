package vn.clinic.cdm.api.dto.clinical;

import lombok.Builder;
import lombok.Data;

import vn.clinic.cdm.api.dto.medication.PrescriptionItemDto;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ConsultationSummaryPdfDto {
    private UUID consultationId;
    private String patientName;
    private String patientDob;
    private String patientGender;
    private String doctorName;
    private Instant consultationDate;
    private String diagnosis;
    private String chiefComplaint;
    private String clinicalNotes;

    // Vitals
    private List<VitalDto> vitals;

    // Lab Results
    private List<LabResultDto> labResults;

    // Prescription
    private List<PrescriptionItemDto> prescriptionItems;
    private String prescriptionNotes;

    // Imaging
    private List<ImagingDto> imagingResults;

    @Data
    @Builder
    public static class VitalDto {
        private String type;
        private String value;
        private String unit;
    }

    @Data
    @Builder
    public static class ImagingDto {
        private String title;
        private String description;
    }
}

