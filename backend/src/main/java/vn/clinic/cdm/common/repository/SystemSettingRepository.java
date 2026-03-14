package vn.clinic.cdm.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.common.domain.SystemSetting;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, UUID> {
    Optional<SystemSetting> findBySettingKey(String key);
    List<SystemSetting> findByCategory(String category);
}
