package vn.clinic.cdm.service.clinical;

import vn.clinic.cdm.dto.management.AllocationDataDto;
import vn.clinic.cdm.dto.management.AllocatePatientRequest;

public interface AllocationService {
    AllocationDataDto getAllocationData();
    void allocate(AllocatePatientRequest request);
}
