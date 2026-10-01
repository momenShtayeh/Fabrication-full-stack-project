--demo data so the screens are not empty on first start, remove classpath:db/sample from
--spring.flyway.locations in application.properties to start with an empty database instead
--
--running "Generate Batch" on this data batches 4 spools and leaves out the other 5:
--  short of material, they become PENDING_MATERIAL:
--    ISO-1001/SP-02 needs a 6 inch tee, which is out of stock
--    ISO-1003/SP-01 needs more 6 inch pipe than is left after the earlier spools
--    ISO-1003/SP-02 needs 4 inch flanges, which run out on ISO-1002/SP-02
--  skipped, they stay NEW:
--    ISO-1002/SP-03 has no materials defined yet
--    ISO-1004/SP-01 belongs to an ISO that is still under verification

INSERT INTO material_stock (code, description, quantity) VALUES
    ('PIPE-CS-6IN',   'Carbon steel pipe 6 inch SCH40 (metres)', 40),
    ('PIPE-CS-4IN',   'Carbon steel pipe 4 inch SCH40 (metres)', 25),
    ('ELBOW-90-6IN',  '90 degree elbow 6 inch',                  12),
    ('ELBOW-90-4IN',  '90 degree elbow 4 inch',                   6),
    ('FLANGE-WN-6IN', 'Weld neck flange 6 inch',                  8),
    ('FLANGE-WN-4IN', 'Weld neck flange 4 inch',                  4),
    ('GASKET-6IN',    'Spiral wound gasket 6 inch',              10),
    ('BOLT-M20',      'Stud bolt M20 with nuts',                 64),
    ('TEE-6IN',       'Equal tee 6 inch',                         0);

INSERT INTO isos (iso_no, revision, status) VALUES
    ('ISO-1001', 'A', 'VERIFIED'),
    ('ISO-1002', 'B', 'VERIFIED'),
    ('ISO-1003', '0', 'VERIFIED'),
    ('ISO-1004', 'A', 'UNDER_VERIFICATION');

INSERT INTO spools (spool_no, iso_id)
SELECT v.spool_no, i.id
FROM (VALUES
    ('ISO-1001', 'SP-01'),
    ('ISO-1001', 'SP-02'),
    ('ISO-1001', 'SP-03'),
    ('ISO-1002', 'SP-01'),
    ('ISO-1002', 'SP-02'),
    ('ISO-1002', 'SP-03'),
    ('ISO-1003', 'SP-01'),
    ('ISO-1003', 'SP-02'),
    ('ISO-1004', 'SP-01')
) AS v (iso_no, spool_no)
JOIN isos i ON i.iso_no = v.iso_no
ORDER BY v.iso_no, v.spool_no;

INSERT INTO spool_materials (spool_id, material_stock_id, qty_required)
SELECT s.id, m.id, v.qty_required
FROM (VALUES
    ('ISO-1001', 'SP-01', 'PIPE-CS-6IN',   12),
    ('ISO-1001', 'SP-01', 'ELBOW-90-6IN',   2),
    ('ISO-1001', 'SP-01', 'FLANGE-WN-6IN',  2),
    ('ISO-1001', 'SP-01', 'GASKET-6IN',     2),
    ('ISO-1001', 'SP-01', 'BOLT-M20',      16),
    ('ISO-1001', 'SP-02', 'PIPE-CS-6IN',   10),
    ('ISO-1001', 'SP-02', 'TEE-6IN',        1),
    ('ISO-1001', 'SP-02', 'FLANGE-WN-6IN',  1),
    ('ISO-1001', 'SP-03', 'PIPE-CS-4IN',    8),
    ('ISO-1001', 'SP-03', 'ELBOW-90-4IN',   2),
    ('ISO-1002', 'SP-01', 'PIPE-CS-6IN',   15),
    ('ISO-1002', 'SP-01', 'ELBOW-90-6IN',   4),
    ('ISO-1002', 'SP-01', 'FLANGE-WN-6IN',  2),
    ('ISO-1002', 'SP-01', 'GASKET-6IN',     2),
    ('ISO-1002', 'SP-01', 'BOLT-M20',      16),
    ('ISO-1002', 'SP-02', 'PIPE-CS-4IN',   10),
    ('ISO-1002', 'SP-02', 'FLANGE-WN-4IN',  4),
    ('ISO-1002', 'SP-02', 'BOLT-M20',      16),
    ('ISO-1003', 'SP-01', 'PIPE-CS-6IN',   18),
    ('ISO-1003', 'SP-01', 'ELBOW-90-6IN',   3),
    ('ISO-1003', 'SP-02', 'PIPE-CS-4IN',    6),
    ('ISO-1003', 'SP-02', 'ELBOW-90-4IN',   4),
    ('ISO-1003', 'SP-02', 'FLANGE-WN-4IN',  2),
    ('ISO-1004', 'SP-01', 'PIPE-CS-4IN',    4),
    ('ISO-1004', 'SP-01', 'ELBOW-90-4IN',   1)
) AS v (iso_no, spool_no, material_code, qty_required)
JOIN isos i ON i.iso_no = v.iso_no
JOIN spools s ON s.iso_id = i.id AND s.spool_no = v.spool_no
JOIN material_stock m ON m.code = v.material_code;
