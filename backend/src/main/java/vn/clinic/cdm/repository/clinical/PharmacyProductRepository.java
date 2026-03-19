package vn.clinic.cdm.repository.clinical;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.clinic.cdm.entity.clinical.PharmacyProduct;

import java.util.UUID;

public interface PharmacyProductRepository extends JpaRepository<PharmacyProduct, UUID> {

    @Query("SELECT p FROM PharmacyProduct p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))")
    Page<PharmacyProduct> searchProducts(@Param("search") String search, Pageable pageable);
}
