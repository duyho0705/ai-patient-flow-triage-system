package vn.clinic.cdm.service.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.clinic.cdm.entity.patient.Patient;

import java.util.Optional;
import java.util.UUID;

import vn.clinic.cdm.dto.patient.UpdatePatientRequest;

public interface PatientService {
    Patient getById(UUID id);
    Page<Patient> listByTenant(Pageable pageable);
    Page<Patient> searchPatients(String search, String riskLevel, String chronicCondition, Pageable pageable);
    Page<Patient> searchPatientsForDoctor(UUID doctorId, String search, String riskLevel, String chronicCondition, Pageable pageable);
    Optional<Patient> findByCccd(String cccd);
    Optional<Patient> findByPhone(String phone);
    Optional<Patient> findByEmail(String email, UUID tenantId);
    Patient save(Patient patient);
    Patient create(Patient patient);
    Patient update(UUID id, UpdatePatientRequest updates);
    Patient getByUserId(UUID userId);
    Optional<Patient> getByIdentityUserId(UUID identityUserId);
    void registerDeviceToken(Patient patient, String fcmToken, String deviceType);
}
