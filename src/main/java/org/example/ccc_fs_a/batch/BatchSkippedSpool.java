package org.example.ccc_fs_a.batch;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import org.example.ccc_fs_a.spool.Spool;

//part of a batch's report: a spool the generation left out and why, recorded as it was at that moment
@Entity
@Table(name = "batch_skipped_spools")
public class BatchSkippedSpool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    //only a link, set to null by the database if the spool is deleted later; the numbers below keep the report readable
    @Column(name = "spool_id")
    private Long spoolId;

    @Column(nullable = false, length = 50)
    private String isoNo;

    @Column(nullable = false, length = 50)
    private String spoolNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SkipReason reason;

    //the shortages have no meaning on their own, so they are stored as values of this row rather than as entities
    @ElementCollection
    @CollectionTable(name = "batch_skipped_spool_shortages", joinColumns = @JoinColumn(name = "skipped_spool_id"))
    @OrderBy("materialCode")
    private List<MaterialShortage> shortages = new ArrayList<>();

    protected BatchSkippedSpool() {
        //required by JPA
    }

    public BatchSkippedSpool(Batch batch, Spool spool, SkipReason reason, List<MaterialShortage> shortages) {
        this.batch = batch;
        this.spoolId = spool.getId();
        this.isoNo = spool.getIso().getIsoNo();
        this.spoolNo = spool.getSpoolNo();
        this.reason = reason;
        this.shortages = new ArrayList<>(shortages);
    }

    public Long getId() {
        return id;
    }

    public Batch getBatch() {
        return batch;
    }

    public Long getSpoolId() {
        return spoolId;
    }

    public String getIsoNo() {
        return isoNo;
    }

    public String getSpoolNo() {
        return spoolNo;
    }

    public SkipReason getReason() {
        return reason;
    }

    public List<MaterialShortage> getShortages() {
        return List.copyOf(shortages);
    }
}
