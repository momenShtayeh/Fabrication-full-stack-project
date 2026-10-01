package org.example.ccc_fs_a.spool;

import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.ccc_fs_a.common.ApiPaths;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Spool materials", description = "The materials and quantities each spool requires")
@RestController
@RequestMapping(ApiPaths.BASE + "/spools/{spoolId}/materials")
public class SpoolMaterialController {

    private final SpoolMaterialService spoolMaterialService;

    public SpoolMaterialController(SpoolMaterialService spoolMaterialService) {
        this.spoolMaterialService = spoolMaterialService;
    }

    @GetMapping
    public List<SpoolMaterialResponse> getBySpool(@PathVariable Long spoolId) {
        return spoolMaterialService.getBySpool(spoolId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SpoolMaterialResponse add(@PathVariable Long spoolId, @Valid @RequestBody SpoolMaterialRequest request) {
        return spoolMaterialService.add(spoolId, request);
    }

    @PutMapping("/{id}")
    public SpoolMaterialResponse updateQuantity(@PathVariable Long spoolId,
                                                @PathVariable Long id,
                                                @Valid @RequestBody SpoolMaterialUpdateRequest request) {
        return spoolMaterialService.updateQuantity(spoolId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long spoolId, @PathVariable Long id) {
        spoolMaterialService.remove(spoolId, id);
    }
}
