package org.example.ccc_fs_a.spool;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.example.ccc_fs_a.material.Material;

@Entity
@Table(name = "spool_materials")
public class SpoolMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "spool_id", nullable = false)
    private Spool spool;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_stock_id", nullable = false)
    private Material material;

    @Column(nullable = false)
    private Integer qtyRequired;

    protected SpoolMaterial() {
        //required by JPA
    }

    public SpoolMaterial(Spool spool, Material material, Integer qtyRequired) {
        this.spool = spool;
        this.material = material;
        this.qtyRequired = qtyRequired;
    }

    public Long getId() {
        return id;
    }

    public Spool getSpool() {
        return spool;
    }

    public Material getMaterial() {
        return material;
    }

    public Integer getQtyRequired() {
        return qtyRequired;
    }

    public void setQtyRequired(Integer qtyRequired) {
        this.qtyRequired = qtyRequired;
    }
}
