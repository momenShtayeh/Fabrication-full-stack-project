package org.example.ccc_fs_a.iso;

import org.example.ccc_fs_a.common.exception.BusinessRuleException;
import org.example.ccc_fs_a.common.exception.DuplicateResourceException;
import org.example.ccc_fs_a.common.exception.ResourceNotFoundException;
import org.example.ccc_fs_a.spool.SpoolRepository;
import org.example.ccc_fs_a.spool.SpoolStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class IsoService {

    private final IsoRepository isoRepository;
    private final SpoolRepository spoolRepository;

    public IsoService(IsoRepository isoRepository, SpoolRepository spoolRepository) {
        this.isoRepository = isoRepository;
        this.spoolRepository = spoolRepository;
    }

    public Page<IsoResponse> getAll(String search, Pageable pageable) {
        return isoRepository.findByIsoNoContainingIgnoreCase(search.trim(), pageable)
                .map(IsoResponse::from);
    }

    public IsoResponse getById(Long id) {
        return IsoResponse.from(findIso(id));
    }

    @Transactional
    public IsoResponse create(IsoRequest request) {
        ensureIsoNoIsUnique(request.isoNo());

        Iso iso = new Iso(request.isoNo(), request.revision(), request.status());
        return IsoResponse.from(isoRepository.save(iso));
    }

    @Transactional
    public IsoResponse update(Long id, IsoRequest request) {
        Iso iso = findIso(id);
        if (!iso.getIsoNo().equals(request.isoNo())) {
            ensureIsoNoIsUnique(request.isoNo());
        }

        iso.setIsoNo(request.isoNo());
        iso.setRevision(request.revision());
        iso.setStatus(request.status());
        return IsoResponse.from(iso);
    }

    //the database cascades the delete to the iso's spools and their material requirements
    @Transactional
    public void delete(Long id) {
        Iso iso = findIso(id);
        if (spoolRepository.existsByIsoIdAndStatus(id, SpoolStatus.BATCHED)) {
            throw new BusinessRuleException("ISO '" + iso.getIsoNo() + "' has batched spools and cannot be deleted");
        }
        isoRepository.delete(iso);
    }

    public Iso findIso(Long id) {
        return isoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ISO with id " + id + " not found"));
    }

    private void ensureIsoNoIsUnique(String isoNo) {
        if (isoRepository.existsByIsoNo(isoNo)) {
            throw new DuplicateResourceException("ISO with number '" + isoNo + "' already exists");
        }
    }
}
