--the report kept with each batch: every spool the batch generation left out, why, and what it was short of.
--it is a snapshot, so the iso and spool numbers are copied and stay readable if the spool is deleted later

CREATE TABLE batch_skipped_spools (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    spool_id BIGINT,
    iso_no VARCHAR(50) NOT NULL,
    spool_no VARCHAR(50) NOT NULL,
    reason VARCHAR(50) NOT NULL
        CHECK (reason IN ('MATERIAL_SHORTAGE', 'ISO_NOT_VERIFIED', 'NO_MATERIALS')),

    --cancelling a batch removes its report, deleting a spool only removes the link to it
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (spool_id) REFERENCES spools(id) ON DELETE SET NULL
);

CREATE TABLE batch_skipped_spool_shortages (
    id BIGSERIAL PRIMARY KEY,
    skipped_spool_id BIGINT NOT NULL,
    material_code VARCHAR(50) NOT NULL,
    qty_required INTEGER NOT NULL,
    qty_available INTEGER NOT NULL,

    FOREIGN KEY (skipped_spool_id) REFERENCES batch_skipped_spools(id) ON DELETE CASCADE
);

CREATE INDEX idx_batch_skipped_spools_batch_id ON batch_skipped_spools(batch_id);
CREATE INDEX idx_batch_skipped_spools_spool_id ON batch_skipped_spools(spool_id);
CREATE INDEX idx_batch_skipped_spool_shortages_skipped_spool_id ON batch_skipped_spool_shortages(skipped_spool_id);
