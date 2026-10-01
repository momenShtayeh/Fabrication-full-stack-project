package org.example.ccc_fs_a.batch;

import java.util.List;

import org.example.ccc_fs_a.spool.Spool;

//a spool a batch generation left out, why, and (for a shortage) every material it was short of
public record SkippedSpoolResponse(
        Long spoolId,
        String isoNo,
        String spoolNo,
        SkipReason reason,
        List<MaterialShortage> shortages
) {

    public static SkippedSpoolResponse from(Spool spool, SkipReason reason, List<MaterialShortage> shortages) {
        return new SkippedSpoolResponse(spool.getId(), spool.getIso().getIsoNo(), spool.getSpoolNo(), reason, shortages);
    }

    public static SkippedSpoolResponse from(BatchSkippedSpool skipped) {
        return new SkippedSpoolResponse(
                skipped.getSpoolId(),
                skipped.getIsoNo(),
                skipped.getSpoolNo(),
                skipped.getReason(),
                skipped.getShortages()
        );
    }
}
