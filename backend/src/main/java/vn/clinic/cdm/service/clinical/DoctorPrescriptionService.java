package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.medication.PrescriptionDto;
import vn.clinic.cdm.entity.clinical.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

public interface DoctorPrescriptionService {
    List<PrescriptionDto> getActivePrescriptions(UUID patientId);
    Page<PrescriptionDto> getMyPrescriptions(UUID doctorUserId, Pageable pageable);
    PrescriptionDto getPrescriptionById(UUID doctorUserId, UUID prescriptionId);
    PrescriptionDto updatePrescription(UUID doctorUserId, UUID prescriptionId, String notes, String advice);
    PrescriptionDto updatePrescriptionStatus(UUID doctorUserId, UUID prescriptionId, Prescription.PrescriptionStatus status);
}