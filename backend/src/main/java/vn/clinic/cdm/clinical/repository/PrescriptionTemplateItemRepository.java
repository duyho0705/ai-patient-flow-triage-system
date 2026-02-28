package vn.clinic.cdm.clinical.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.clinical.domain.PrescriptionTemplateItem;
import java.util.UUID;

public interface PrescriptionTemplateItemRepository extends JpaRepository<PrescriptionTemplateItem, UUID> {
}

