package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.patient.domain.PatientInsurance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatientInsuranceRepository extends JpaRepository<PatientInsurance, UUID> {

    List<PatientInsurance> findByPatientIdOrderByIsPrimaryDesc(UUID patientId);

    Optional<PatientInsurance> findByPatientIdAndIsPrimaryTrue(UUID patientId);
}

