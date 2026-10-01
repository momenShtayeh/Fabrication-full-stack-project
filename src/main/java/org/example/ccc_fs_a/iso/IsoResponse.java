package org.example.ccc_fs_a.iso;

public record IsoResponse(Long id, String isoNo, String revision, IsoStatus status) {

    public static IsoResponse from(Iso iso) {
        return new IsoResponse(iso.getId(), iso.getIsoNo(), iso.getRevision(), iso.getStatus());
    }
}
