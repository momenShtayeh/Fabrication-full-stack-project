package org.example.ccc_fs_a.batch;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "batches")
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String batchNo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    protected Batch() {
        //required by JPA
    }

    public Batch(String batchNo) {
        this.batchNo = batchNo;
        //postgresql timestamps store microseconds, rounding keeps the saved and returned values equal
        this.createdDate = LocalDateTime.now().truncatedTo(ChronoUnit.MICROS);
    }

    public Long getId() {
        return id;
    }

    public String getBatchNo() {
        return batchNo;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }
}
