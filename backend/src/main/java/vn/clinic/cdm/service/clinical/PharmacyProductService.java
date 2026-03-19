package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.clinical.PharmacyProductDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PharmacyProductService {
    Page<PharmacyProductDto> searchProducts(String query, Pageable pageable);
    List<PharmacyProductDto> searchProducts(String query);
}