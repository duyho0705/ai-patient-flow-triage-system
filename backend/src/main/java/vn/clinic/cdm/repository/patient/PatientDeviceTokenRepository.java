package vn.clinic.cdm.repository.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.patient.PatientDeviceToken;

import java.util.List;
import java.util.UUID;

public interface PatientDeviceTokenRepository extends JpaRepository<PatientDeviceToken, UUID> {
    java.util.Optional<PatientDeviceToken> findByFcmToken(String fcmToken);

    List<PatientDeviceToken> findByPatientId(UUID patientId);

    void deleteByFcmToken(String fcmToken);
}

