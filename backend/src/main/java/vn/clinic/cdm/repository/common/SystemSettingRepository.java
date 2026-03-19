package vn.clinic.cdm.repository.common;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.clinic.cdm.entity.common.SystemSetting;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, UUID> {
    Optional<SystemSetting> findBySettingKey(String key);
    List<SystemSetting> findByCategory(String category);
}
