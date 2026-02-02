package vn.clinic.patientflow.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.patient.domain.PatientDeviceToken;

import java.util.List;
import java.util.UUID;

public interface PatientDeviceTokenRepository extends JpaRepository<PatientDeviceToken, UUID> {
    List<PatientDeviceToken> findByPatientId(UUID patientId);

    void deleteByFcmToken(String fcmToken);
}
