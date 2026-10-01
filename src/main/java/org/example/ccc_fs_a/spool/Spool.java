package org.example.ccc_fs_a.spool;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.example.ccc_fs_a.iso.Iso;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@Table(name = "spools")
public class Spool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String spoolNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "iso_id", nullable = false)
    private Iso iso;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SpoolStatus status = SpoolStatus.NEW;

    protected Spool() {
        //required by JPA
    }

    public Spool(String spoolNo, Iso iso) {
        this.spoolNo = spoolNo;
        this.iso = iso;
    }

    public String getSpoolNo() {
        return spoolNo;
    }

    public void setSpoolNo(String spoolNo) {
        this.spoolNo = spoolNo;
    }

    public Iso getIso() {
        return iso;
    }

    public void setIso(Iso iso) {
        this.iso = iso;
    }

    public SpoolStatus getStatus() {
        return status;
    }

    public void setStatus(SpoolStatus status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }
}