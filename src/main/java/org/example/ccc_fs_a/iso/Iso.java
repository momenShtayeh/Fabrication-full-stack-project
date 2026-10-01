package org.example.ccc_fs_a.iso;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

@Entity
@Table(name = "isos")
public class Iso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false, unique = true)
    private String isoNo;

    @Column(length = 10, nullable = false)
    private String revision;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private IsoStatus status;

    protected Iso() {
        //required by JPA
    }

    public Iso(String isoNo, String revision, IsoStatus status) {
        this.isoNo = isoNo;
        this.revision = revision;
        this.status = status;
    }

    public String getIsoNo() {
        return isoNo;
    }

    public void setIsoNo(String isoNo) {
        this.isoNo = isoNo;
    }

    public String getRevision() {
        return revision;
    }

    public void setRevision(String revision) {
        this.revision = revision;
    }

    public IsoStatus getStatus() {
        return status;
    }

    public void setStatus(IsoStatus status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }
}