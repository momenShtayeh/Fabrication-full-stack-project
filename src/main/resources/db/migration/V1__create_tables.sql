CREATE TABLE material_stock (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE isos (
    id BIGSERIAL PRIMARY KEY,
    iso_no VARCHAR(50) NOT NULL UNIQUE,
    revision VARCHAR(10) NOT NULL, --drawing revisions can be numbers or letters (0, 1, A, B)
    status VARCHAR(50) NOT NULL
        CHECK (status IN ('UNVERIFIED', 'UNDER_VERIFICATION', 'VERIFIED'))
);

CREATE TABLE spools (
    id BIGSERIAL PRIMARY KEY,
    spool_no VARCHAR(50) NOT NULL,
    iso_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW'
        CHECK (status IN ('NEW', 'PENDING_MATERIAL', 'BATCHED')),

    --deleting an iso deletes its spools, the same spool number may repeat across different isos
    FOREIGN KEY (iso_id) REFERENCES isos(id) ON DELETE CASCADE,
    UNIQUE (iso_id, spool_no)
);

CREATE TABLE spool_materials (
    id BIGSERIAL PRIMARY KEY,
    spool_id BIGINT NOT NULL,
    material_stock_id BIGINT NOT NULL,
    qty_required INTEGER NOT NULL CHECK (qty_required > 0),

    --a material in use by a spool cannot be deleted, and is listed once per spool
    FOREIGN KEY (spool_id) REFERENCES spools(id) ON DELETE CASCADE,
    FOREIGN KEY (material_stock_id) REFERENCES material_stock(id),
    UNIQUE (spool_id, material_stock_id)
);

CREATE TABLE batches (
    id BIGSERIAL PRIMARY KEY,
    batch_no VARCHAR(50) NOT NULL UNIQUE,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE batch_spools (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL,
    spool_id BIGINT NOT NULL,

    --a spool's stock is deducted once, so it can only belong to one batch
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (spool_id) REFERENCES spools(id),
    UNIQUE (spool_id)
);

--postgresql does not index foreign key columns automatically
CREATE INDEX idx_spools_iso_id ON spools(iso_id);
CREATE INDEX idx_spool_materials_material_stock_id ON spool_materials(material_stock_id);
CREATE INDEX idx_batch_spools_batch_id ON batch_spools(batch_id);
