package vn.clinic.cdm.service.clinical;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.clinic.cdm.dto.clinical.ConsultationSummaryPdfDto;
import vn.clinic.cdm.dto.medication.CreatePrescriptionRequest;
import vn.clinic.cdm.dto.medication.PrescriptionDto;
import vn.clinic.cdm.entity.clinical.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClinicalService {
    ClinicalConsultation getById(UUID id);
    List<ClinicalConsultation> getPatientHistory(UUID patientId);
    ClinicalConsultation startConsultation(UUID patientId, UUID doctorId);
    ClinicalConsultation updateConsultation(UUID id, String diagnosis, String prescription);
    ClinicalConsultation completeConsultation(UUID id);
    Prescription createPrescription(CreatePrescriptionRequest request);
    List<ClinicalConsultation> getConsultationsByPatient(UUID patientId);
    Page<ClinicalConsultation> getConsultationsByPatientPageable(UUID patientId, Pageable pageable);
    List<ClinicalConsultation> getRecentConsultationsByPatient(UUID patientId, int limit);
    Optional<Prescription> getPrescriptionByConsultation(UUID consultationId);
    ConsultationSummaryPdfDto getConsultationSummaryForPdf(UUID id);
    PrescriptionDto mapPrescriptionToDto(Prescription p);
    List<ClinicalVital> getVitals(UUID consultationId);
    List<LabResult> getLabResults(UUID consultationId);
    List<DiagnosticImage> getDiagnosticImages(UUID consultationId);
    void orderDiagnosticImage(UUID consultationId, String title);
}
