package vn.clinic.cdm.service.auth;

import vn.clinic.cdm.entity.identity.IdentityUser;

import java.time.LocalDate;
import java.util.UUID;

public interface RegisterService {
    IdentityUser registerPatientByDoctor(String email, String fullName, String password, UUID tenantId,
                                         UUID branchId, LocalDate dob, String gender, String phone, String cccd, String chronicConditions);
}
