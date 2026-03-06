package vn.clinic.cdm.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.clinical.domain.Prescription;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
        List<Prescription> findByPatientId(UUID patientId);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "medications", "consultation",
                        "consultation.patient" })
        List<Prescription> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "medications", "consultation",
                        "consultation.patient" })
        Optional<Prescription> findByConsultationId(UUID consultationId);

        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "medications", "consultation",
                        "consultation.patient" })
        List<Prescription> findByStatusAndConsultationBranchIdOrderByCreatedAtDesc(
                        Prescription.PrescriptionStatus status, UUID branchId);

        /** Lấy danh sách đơn thuốc do bác sĩ kê (phân trang) */
        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "medications", "consultation",
                        "consultation.patient", "patient" })
        org.springframework.data.domain.Page<Prescription> findByDoctorIdOrderByCreatedAtDesc(
                        UUID doctorId, org.springframework.data.domain.Pageable pageable);

        /** Lấy tất cả đơn thuốc do bác sĩ kê */
        @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "medications", "consultation",
                        "consultation.patient", "patient" })
        List<Prescription> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId);
}
