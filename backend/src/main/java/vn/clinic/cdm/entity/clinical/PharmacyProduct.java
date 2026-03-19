package vn.clinic.cdm.entity.clinical;

import jakarta.persistence.*;
import lombok.*;

import vn.clinic.cdm.entity.common.BaseEntity;



@Entity
@Table(name = "pharmacy_products")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyProduct extends BaseEntity {



    @Column(name = "code", unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // "Tiểu đường", "Huyết áp", vv.

    @Column(nullable = false)
    private String unit; // "Viên", "Ống", vv.

    @Column(name = "stock_quantity")
    private Integer stockQuantity;
}
