package vn.clinic.cdm.repository.clinical;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.clinical.PrescriptionTemplateItem;
import java.util.UUID;

public interface PrescriptionTemplateItemRepository extends JpaRepository<PrescriptionTemplateItem, UUID> {
}

