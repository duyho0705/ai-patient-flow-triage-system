package vn.clinic.cdm.clinical.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.clinical.domain.Doctor;
import vn.clinic.cdm.clinical.domain.Prescription;
import vn.clinic.cdm.clinical.repository.DoctorRepository;
import vn.clinic.cdm.clinical.repository.PrescriptionRepository;
import vn.clinic.cdm.common.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Service quản lý đơn thuốc điện tử dành riêng cho Doctor Portal.
 * <p>
 * Tách biệt khỏi ClinicalService để tuân thủ Single Responsibility Principle.
 * Chỉ chứa logic liên quan đến bác sĩ xem / cập nhật đơn thuốc từ portal của
 * mình.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorPrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;

    /**
     * Lấy Doctor entity từ userId (IdentityUser). Nếu không tìm thấy thì throw.
     */
    @Transactional(readOnly = true)
    public Doctor getDoctorByUserId(UUID userId) {
        return doctorRepository.findByIdentityUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", userId));
    }

    /**
     * Danh sách đơn thuốc do bác sĩ kê (phân trang).
     */
    @Transactional(readOnly = true)
    public Page<Prescription> getMyPrescriptions(UUID doctorUserId, Pageable pageable) {
        Doctor doctor = getDoctorByUserId(doctorUserId);
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId(), pageable);
    }

    /**
     * Tất cả đơn thuốc do bác sĩ kê (không phân trang — dùng cho export).
     */
    @Transactional(readOnly = true)
    public List<Prescription> getAllMyPrescriptions(UUID doctorUserId) {
        Doctor doctor = getDoctorByUserId(doctorUserId);
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId());
    }

    /**
     * Lấy chi tiết một đơn thuốc (kiểm tra quyền sở hữu).
     */
    @Transactional(readOnly = true)
    public Prescription getPrescriptionById(UUID prescriptionId, UUID doctorUserId) {
        Doctor doctor = getDoctorByUserId(doctorUserId);
        Prescription p = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

        if (p.getDoctor() != null && !p.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalStateException("Bạn không có quyền xem đơn thuốc này");
        }
        return p;
    }

    /**
     * Cập nhật nội dung đơn thuốc (chẩn đoán, ghi chú).
     */
    @Transactional
    public Prescription updatePrescription(UUID prescriptionId, UUID doctorUserId,
            String diagnosis, String notes) {
        Prescription p = getPrescriptionById(prescriptionId, doctorUserId);

        if (p.getStatus() == Prescription.PrescriptionStatus.DISPENSED
                || p.getStatus() == Prescription.PrescriptionStatus.CANCELLED) {
            throw new IllegalStateException("Không thể sửa đơn thuốc ở trạng thái " + p.getStatus());
        }

        if (diagnosis != null) {
            p.setDiagnosis(diagnosis);
        }
        if (notes != null) {
            p.setNotes(notes);
        }

        log.info("Doctor {} updated prescription {}", doctorUserId, prescriptionId);
        return prescriptionRepository.save(p);
    }

    /**
     * Đổi trạng thái đơn thuốc (chỉ cho phép một số transition hợp lệ).
     */
    @Transactional
    public Prescription updatePrescriptionStatus(UUID prescriptionId, UUID doctorUserId,
            Prescription.PrescriptionStatus newStatus) {
        Prescription p = getPrescriptionById(prescriptionId, doctorUserId);

        // Validate transition
        validateStatusTransition(p.getStatus(), newStatus);

        p.setStatus(newStatus);
        log.info("Doctor {} changed prescription {} status from {} to {}",
                doctorUserId, prescriptionId, p.getStatus(), newStatus);
        return prescriptionRepository.save(p);
    }

    private void validateStatusTransition(Prescription.PrescriptionStatus current,
            Prescription.PrescriptionStatus target) {
        boolean valid = switch (current) {
            case DRAFT -> target == Prescription.PrescriptionStatus.ISSUED
                    || target == Prescription.PrescriptionStatus.CANCELLED;
            case ISSUED -> target == Prescription.PrescriptionStatus.DISPENSED
                    || target == Prescription.PrescriptionStatus.CANCELLED;
            case DISPENSED, CANCELLED -> false;
        };

        if (!valid) {
            throw new IllegalStateException(
                    "Không thể chuyển trạng thái đơn thuốc từ " + current + " sang " + target);
        }
    }
}
