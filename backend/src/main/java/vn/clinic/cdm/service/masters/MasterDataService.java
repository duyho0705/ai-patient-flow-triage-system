package vn.clinic.cdm.service.masters;

import vn.clinic.cdm.entity.masters.MedicalService;
import java.util.List;
import java.util.UUID;

public interface MasterDataService {
    List<MedicalService> listMedicalServices(boolean onlyActive);
    MedicalService createMedicalService(MedicalService svc);
    MedicalService updateMedicalService(UUID id, MedicalService details);
}
