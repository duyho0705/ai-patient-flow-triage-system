package vn.clinic.cdm.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.patient.domain.Patient;
import vn.clinic.cdm.patient.domain.PatientRelative;

import java.util.List;
import java.util.UUID;

public interface PatientRelativeRepository extends JpaRepository<PatientRelative, UUID> {
    List<PatientRelative> findByPatient(Patient patient);
}

