package org.example.ccc_fs_a.dashboard;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.ccc_fs_a.common.ApiPaths;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "Summary totals")
@RestController
@RequestMapping(ApiPaths.BASE + "/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getSummary() {
        return dashboardService.getSummary();
    }
}
