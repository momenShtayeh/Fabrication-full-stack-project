package org.example.ccc_fs_a.batch;

import java.util.List;

/*
 * The result of one batch generation. batch is null when no spool could be batched; skippedSpools lists the spools
 * left out and why either way (when a batch was created it is the same list as the batch's report).
 */
public record BatchGenerationResponse(BatchDetailResponse batch, List<SkippedSpoolResponse> skippedSpools) {
}
