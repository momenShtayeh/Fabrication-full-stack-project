package org.example.ccc_fs_a.spool;

public record SpoolResponse(Long id, String spoolNo, Long isoId, String isoNo, SpoolStatus status) {

    public static SpoolResponse from(Spool spool) {
        return new SpoolResponse(
                spool.getId(),
                spool.getSpoolNo(),
                spool.getIso().getId(),
                spool.getIso().getIsoNo(),
                spool.getStatus()
        );
    }
}
