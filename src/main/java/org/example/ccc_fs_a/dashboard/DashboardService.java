package org.example.ccc_fs_a.dashboard;

import org.example.ccc_fs_a.batch.BatchRepository;
import org.example.ccc_fs_a.iso.IsoRepository;
import org.example.ccc_fs_a.material.MaterialRepository;
import org.example.ccc_fs_a.spool.SpoolRepository;
import org.example.ccc_fs_a.spool.SpoolStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final IsoRepository isoRepository;
    private final SpoolRepository spoolRepository;
    private final MaterialRepository materialRepository;
    private final BatchRepository batchRepository;

    public DashboardService(IsoRepository isoRepository,
                            SpoolRepository spoolRepository,
                            MaterialRepository materialRepository,
                            BatchRepository batchRepository) {
        this.isoRepository = isoRepository;
        this.spoolRepository = spoolRepository;
        this.materialRepository = materialRepository;
        this.batchRepository = batchRepository;
    }

    //"available materials" counts the materials that still have stock left
    public DashboardResponse getSummary() {
        return new DashboardResponse(
                isoRepository.count(),
                spoolRepository.count(),
                materialRepository.countByQuantityGreaterThan(0),
                batchRepository.count(),
                spoolRepository.countByStatus(SpoolStatus.PENDING_MATERIAL),
                spoolRepository.countByStatus(SpoolStatus.NEW),
                spoolRepository.countByStatus(SpoolStatus.BATCHED)
        );
    }
}
