package vn.clinic.cdm.entity.identity;

import jakarta.persistence.*;
import lombok.*;
import vn.clinic.cdm.entity.common.BaseEntity;
import java.util.UUID;

@Entity
@Table(name = "identity_permission")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityPermission extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String code; // e.g., "PATIENT_VIEW", "PATIENT_CREATE"

    @Column(length = 255)
    private String name;

    @Column(length = 500)
    private String description;

    public IdentityPermission(UUID id) {
        super(id);
    }
}
