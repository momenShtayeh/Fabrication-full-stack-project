package org.example.ccc_fs_a.spool;

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

@Tag(name = "Spools", description = "Spools, managed under their ISO")
@RestController
@RequestMapping(ApiPaths.BASE)
public class SpoolController {

    private final SpoolService spoolService;

    public SpoolController(SpoolService spoolService) {
        this.spoolService = spoolService;
    }

    @GetMapping("/isos/{isoId}/spools")
    public PageResponse<SpoolResponse> getByIso(@PathVariable Long isoId,
                                                @ParameterObject @PageableDefault(sort = "spoolNo") Pageable pageable) {
        return PageResponse.from(spoolService.getByIso(isoId, pageable));
    }

    @PostMapping("/isos/{isoId}/spools")
    @ResponseStatus(HttpStatus.CREATED)
    public SpoolResponse create(@PathVariable Long isoId, @Valid @RequestBody SpoolRequest request) {
        return spoolService.create(isoId, request);
    }

    @GetMapping("/spools")
    public PageResponse<SpoolResponse> search(@RequestParam(defaultValue = "") String search,
                                              @RequestParam(required = false) SpoolStatus status,
                                              @ParameterObject @PageableDefault(sort = "spoolNo") Pageable pageable) {
        return PageResponse.from(spoolService.search(search, status, pageable));
    }

    @GetMapping("/spools/{id}")
    public SpoolResponse getById(@PathVariable Long id) {
        return spoolService.getById(id);
    }

    @PutMapping("/spools/{id}")
    public SpoolResponse update(@PathVariable Long id, @Valid @RequestBody SpoolRequest request) {
        return spoolService.update(id, request);
    }

    @DeleteMapping("/spools/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        spoolService.delete(id);
    }
}
