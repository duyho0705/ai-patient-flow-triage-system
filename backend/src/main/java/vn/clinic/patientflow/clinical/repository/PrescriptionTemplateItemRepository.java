package vn.clinic.patientflow.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.patientflow.clinical.domain.PrescriptionTemplateItem;
import java.util.UUID;

public interface PrescriptionTemplateItemRepository extends JpaRepository<PrescriptionTemplateItem, UUID> {
}
