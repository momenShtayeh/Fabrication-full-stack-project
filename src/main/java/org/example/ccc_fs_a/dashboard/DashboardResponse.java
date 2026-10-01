package org.example.ccc_fs_a.dashboard;

public record DashboardResponse(
        long totalIsos,
        long totalSpools,
        long availableMaterials,
        long generatedBatches,
        long pendingSpools,
        long newSpools,
        long batchedSpools
) {
}
