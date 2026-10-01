package org.example.ccc_fs_a.material;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.example.ccc_fs_a.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

//web layer test: real controller, validation, error handler and security rules, with a mocked service and no database
@WebMvcTest(MaterialController.class)
@Import(SecurityConfig.class)
class MaterialControllerTest {

    private static final String URL = "/api/v1/fabrication/materials";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MaterialService materialService;

    @Test
    void rejectsRequestsWithoutCredentials() throws Exception {
        mockMvc.perform(get(URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "VIEWER")
    void viewerCanListMaterials() throws Exception {
        MaterialResponse pipe = new MaterialResponse(1L, "PIPE", "Pipe", 10);
        when(materialService.getAll(eq(""), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(pipe)));

        mockMvc.perform(get(URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].code").value("PIPE"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "VIEWER")
    void viewerCannotCreateMaterials() throws Exception {
        mockMvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(validMaterialJson()))
                .andExpect(status().isForbidden());
        verify(materialService, never()).create(any());
    }

    @Test
    @WithMockUser(roles = "PLANNER")
    void plannerCanCreateMaterials() throws Exception {
        when(materialService.create(any())).thenReturn(new MaterialResponse(1L, "PIPE", "Pipe", 10));

        mockMvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(validMaterialJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "PLANNER")
    void rejectsInvalidMaterialWithFieldErrors() throws Exception {
        String invalidJson = """
                {"code": "", "description": "Pipe", "quantity": -1}
                """;

        mockMvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.code").exists())
                .andExpect(jsonPath("$.errors.quantity").exists());
        verify(materialService, never()).create(any());
    }

    private String validMaterialJson() {
        return """
                {"code": "PIPE", "description": "Pipe", "quantity": 10}
                """;
    }
}
