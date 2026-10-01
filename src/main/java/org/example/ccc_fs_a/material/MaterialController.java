package org.example.ccc_fs_a.material;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.example.ccc_fs_a.common.ApiPaths;
import org.example.ccc_fs_a.common.PageResponse;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Materials", description = "Warehouse stock of materials")
@RestController
@RequestMapping(ApiPaths.BASE + "/materials")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    public PageResponse<MaterialResponse> getAll(@RequestParam(defaultValue = "") String search,
                                                 @ParameterObject @PageableDefault(sort = "code") Pageable pageable) {
        return PageResponse.from(materialService.getAll(search, pageable));
    }

    @GetMapping("/{id}")
    public MaterialResponse getById(@PathVariable Long id) {
        return materialService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialResponse create(@Valid @RequestBody MaterialRequest request) {
        return materialService.create(request);
    }

    @PutMapping("/{id}")
    public MaterialResponse update(@PathVariable Long id, @Valid @RequestBody MaterialRequest request) {
        return materialService.update(id, request);
    }

    @Operation(summary = "Receive stock", description = "Adds the quantity that arrived to the material's current stock")
    @PostMapping("/{id}/receive")
    public MaterialResponse receiveStock(@PathVariable Long id, @Valid @RequestBody StockReceiptRequest request) {
        return materialService.receiveStock(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        materialService.delete(id);
    }
}
