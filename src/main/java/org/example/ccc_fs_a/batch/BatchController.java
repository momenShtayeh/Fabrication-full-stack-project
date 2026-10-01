package org.example.ccc_fs_a.batch;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.ccc_fs_a.common.ApiPaths;
import org.example.ccc_fs_a.common.PageResponse;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Batches", description = "Batch generation and generated batches")
@RestController
@RequestMapping(ApiPaths.BASE + "/batches")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    @GetMapping
    public PageResponse<BatchResponse> getAll(
            @ParameterObject @PageableDefault(sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponse.from(batchService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public BatchDetailResponse getById(@PathVariable Long id) {
        return batchService.getById(id);
    }

    @Operation(summary = "Generate a batch",
            description = "Batches every spool whose required materials are all in stock and deducts that stock. "
                    + "Spools that are short of material become PENDING_MATERIAL and are returned with their shortages.")
    @PostMapping("/generate")
    public BatchGenerationResponse generate() {
        return batchService.generate();
    }

    @Operation(summary = "Cancel a batch", description = "Returns the batch's spools to NEW and their materials to stock. "
            + "Pending spools whose materials are then all in stock also return to NEW.")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        batchService.delete(id);
    }
}
