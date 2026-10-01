package org.example.ccc_fs_a.batch;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.example.ccc_fs_a.spool.Spool;

@Entity
@Table(name = "batch_spools")
public class BatchSpool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    //unique: a spool's stock is deducted once, so it can only belong to one batch
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "spool_id", nullable = false, unique = true)
    private Spool spool;

    protected BatchSpool() {
        //required by JPA
    }

    public BatchSpool(Batch batch, Spool spool) {
        this.batch = batch;
        this.spool = spool;
    }

    public Long getId() {
        return id;
    }

    public Batch getBatch() {
        return batch;
    }

    public Spool getSpool() {
        return spool;
    }
}
