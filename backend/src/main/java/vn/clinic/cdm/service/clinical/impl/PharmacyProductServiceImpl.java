package vn.clinic.cdm.service.clinical.impl;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.clinic.cdm.entity.clinical.PharmacyProduct;
import vn.clinic.cdm.repository.clinical.PharmacyProductRepository;
import vn.clinic.cdm.dto.clinical.PharmacyProductDto;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyProductServiceImpl implements vn.clinic.cdm.service.clinical.PharmacyProductService {

    private final PharmacyProductRepository repository;

    @PostConstruct
    @Transactional
    public void seedInitialData() {
        if (repository.count() == 0) {
            log.info("Seeding PharmacyProduct table...");
            List<PharmacyProduct> seeds = List.of(
                PharmacyProduct.builder().code("001").name("Metformin 500mg").unit("Viên").type("Tiểu đường").stockQuantity(100).build(),
                PharmacyProduct.builder().code("002").name("Gliclazide 30mg").unit("Viên").type("Tiểu đường").stockQuantity(50).build(),
                PharmacyProduct.builder().code("003").name("Amlodipine 5mg").unit("Viên").type("Huyết áp").stockQuantity(200).build(),
                PharmacyProduct.builder().code("004").name("Losartan 50mg").unit("Viên").type("Huyết áp").stockQuantity(150).build(),
                PharmacyProduct.builder().code("005").name("Lisinopril 10mg").unit("Viên").type("Huyết áp").stockQuantity(80).build(),
                PharmacyProduct.builder().code("006").name("Atorvastatin 20mg").unit("Viên").type("Mỡ máu").stockQuantity(120).build(),
                PharmacyProduct.builder().code("007").name("Rosuvastatin 10mg").unit("Viên").type("Mỡ máu").stockQuantity(90).build(),
                PharmacyProduct.builder().code("008").name("Aspirin 81mg").unit("Viên").type("Tim mạch").stockQuantity(300).build()
            );
            repository.saveAll(seeds);
            log.info("Seeded {} pharmacy products", seeds.size());
        }
    }

    @Override
    public Page<PharmacyProductDto> searchProducts(String search, Pageable pageable) {
        String keyword = search != null ? search : "";
        return repository.searchProducts(keyword, pageable).map(PharmacyProductDto::fromEntity);
    }

    @Override
    public java.util.List<PharmacyProductDto> searchProducts(String query) {
        return repository.searchProducts(query, Pageable.unpaged()).getContent().stream().map(PharmacyProductDto::fromEntity).collect(java.util.stream.Collectors.toList());
    }
}
