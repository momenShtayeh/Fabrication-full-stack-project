package org.example.ccc_fs_a.material;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "material_stock")
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Integer quantity;

    //incremented by hibernate on every update, prevents two batches deducting the same stock at once
    @Version
    private Long version;

    protected Material() {
        //required by JPA
    }

    public Material(String code, String description, Integer quantity) {
        this.code = code;
        this.description = description;
        this.quantity = quantity;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Long getVersion() {
        return version;
    }

    public void deductStock(int amount) {
        if (amount > quantity) {
            throw new IllegalStateException("Not enough stock of material " + code);
        }
        quantity -= amount;
    }

    public void addStock(int amount) {
        quantity += amount;
    }
}
