package org.example.ccc_fs_a.iso;

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

@Tag(name = "ISOs", description = "Engineering ISO drawings")
@RestController
@RequestMapping(ApiPaths.BASE + "/isos")
public class IsoController {

    private final IsoService isoService;

    public IsoController(IsoService isoService) {
        this.isoService = isoService;
    }

    @GetMapping
    public PageResponse<IsoResponse> getAll(@RequestParam(defaultValue = "") String search,
                                            @ParameterObject @PageableDefault(sort = "isoNo") Pageable pageable) {
        return PageResponse.from(isoService.getAll(search, pageable));
    }

    @GetMapping("/{id}")
    public IsoResponse getById(@PathVariable Long id) {
        return isoService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IsoResponse create(@Valid @RequestBody IsoRequest request) {
        return isoService.create(request);
    }

    @PutMapping("/{id}")
    public IsoResponse update(@PathVariable Long id, @Valid @RequestBody IsoRequest request) {
        return isoService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        isoService.delete(id);
    }
}
