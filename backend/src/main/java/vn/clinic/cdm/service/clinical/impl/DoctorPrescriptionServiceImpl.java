package vn.clinic.cdm.service.clinical.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.dto.medication.PrescriptionDto;
import vn.clinic.cdm.entity.clinical.Doctor;
import vn.clinic.cdm.entity.clinical.Prescription;
import vn.clinic.cdm.repository.clinical.DoctorRepository;
import vn.clinic.cdm.repository.clinical.PrescriptionRepository;
import vn.clinic.cdm.exception.ResourceNotFoundException;
import vn.clinic.cdm.service.clinical.DoctorPrescriptionService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorPrescriptionServiceImpl implements DoctorPrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;

    @Override
    public List<PrescriptionDto> getActivePrescriptions(UUID patientId) {
        return prescriptionRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(patientId, Prescription.PrescriptionStatus.ISSUED)
                .stream().map(PrescriptionDto::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrescriptionDto> getMyPrescriptions(UUID doctorUserId, Pageable pageable) {
        Doctor doctor = findDoctorByUserId(doctorUserId);
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId(), pageable)
                .map(PrescriptionDto::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionDto getPrescriptionById(UUID doctorUserId, UUID prescriptionId) {
        Doctor doctor = findDoctorByUserId(doctorUserId);
        Prescription p = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

        if (p.getDoctor() != null && !p.getDoctor().getId().equals(doctor.getId())) {
            throw new IllegalStateException("Bạn không có quyền xem đơn thuốc này");
        }
        return PrescriptionDto.fromEntity(p);
    }

    @Override
    @Transactional
    public PrescriptionDto updatePrescription(UUID doctorUserId, UUID prescriptionId, String diagnosis, String notes) {
        getPrescriptionById(doctorUserId, prescriptionId); // authorization check
        Prescription p = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

        if (p.getStatus() == Prescription.PrescriptionStatus.DISPENSED
                || p.getStatus() == Prescription.PrescriptionStatus.CANCELLED) {
            throw new IllegalStateException("Không thể sửa đơn thuốc ở trạng thái " + p.getStatus());
        }

        if (diagnosis != null) p.setDiagnosis(diagnosis);
        if (notes != null) p.setNotes(notes);

        return PrescriptionDto.fromEntity(prescriptionRepository.save(p));
    }

    @Override
    @Transactional
    public PrescriptionDto updatePrescriptionStatus(UUID doctorUserId, UUID prescriptionId, Prescription.PrescriptionStatus newStatus) {
        getPrescriptionById(doctorUserId, prescriptionId); // authorization check
        Prescription p = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", prescriptionId));

        validateStatusTransition(p.getStatus(), newStatus);
        p.setStatus(newStatus);
        return PrescriptionDto.fromEntity(prescriptionRepository.save(p));
    }

    private Doctor findDoctorByUserId(UUID userId) {
        return doctorRepository.findByIdentityUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", userId));
    }

    private void validateStatusTransition(Prescription.PrescriptionStatus current, Prescription.PrescriptionStatus target) {
        boolean valid = switch (current) {
            case DRAFT -> target == Prescription.PrescriptionStatus.ISSUED || target == Prescription.PrescriptionStatus.CANCELLED;
            case ISSUED -> target == Prescription.PrescriptionStatus.DISPENSED || target == Prescription.PrescriptionStatus.CANCELLED;
            default -> false;
        };
        if (!valid) throw new IllegalStateException("Không thể chuyển trạng thái từ " + current + " sang " + target);
    }
}
