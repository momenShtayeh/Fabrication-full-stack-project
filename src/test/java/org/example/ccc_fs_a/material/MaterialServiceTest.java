package org.example.ccc_fs_a.material;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.example.ccc_fs_a.common.exception.BusinessRuleException;
import org.example.ccc_fs_a.common.exception.DuplicateResourceException;
import org.example.ccc_fs_a.common.exception.ResourceNotFoundException;
import org.example.ccc_fs_a.spool.SpoolMaterialRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MaterialServiceTest {

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private SpoolMaterialRepository spoolMaterialRepository;

    @InjectMocks
    private MaterialService materialService;

    @Test
    void create_rejectsDuplicateCode() {
        when(materialRepository.existsByCode("PIPE")).thenReturn(true);

        assertThatThrownBy(() -> materialService.create(new MaterialRequest("PIPE", "Pipe", 5)))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("PIPE");
        verify(materialRepository, never()).save(any());
    }

    @Test
    void update_allowsKeepingTheSameCode() {
        Material material = new Material("PIPE", "Pipe", 5);
        when(materialRepository.findById(1L)).thenReturn(Optional.of(material));

        MaterialResponse response = materialService.update(1L, new MaterialRequest("PIPE", "Steel pipe", 8));

        assertThat(response.description()).isEqualTo("Steel pipe");
        assertThat(response.quantity()).isEqualTo(8);
        verify(materialRepository, never()).existsByCode(anyString());
    }

    @Test
    void receiveStock_addsToTheCurrentQuantity() {
        when(materialRepository.findById(1L)).thenReturn(Optional.of(new Material("PIPE", "Pipe", 5)));

        MaterialResponse response = materialService.receiveStock(1L, new StockReceiptRequest(20));

        assertThat(response.quantity()).isEqualTo(25);
    }

    @Test
    void delete_rejectsMaterialRequiredBySpools() {
        when(materialRepository.findById(1L)).thenReturn(Optional.of(new Material("PIPE", "Pipe", 5)));
        when(spoolMaterialRepository.existsByMaterialId(1L)).thenReturn(true);

        assertThatThrownBy(() -> materialService.delete(1L)).isInstanceOf(BusinessRuleException.class);
        verify(materialRepository, never()).delete(any());
    }

    @Test
    void getById_throwsNotFound_whenMaterialDoesNotExist() {
        when(materialRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> materialService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}
