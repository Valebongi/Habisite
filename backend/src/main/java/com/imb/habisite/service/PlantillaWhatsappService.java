package com.imb.habisite.service;

import com.imb.habisite.dto.PlantillaWhatsappRequestDTO;
import com.imb.habisite.dto.PlantillaWhatsappResponseDTO;

import java.util.List;

public interface PlantillaWhatsappService {

    PlantillaWhatsappResponseDTO crear(PlantillaWhatsappRequestDTO request);

    List<PlantillaWhatsappResponseDTO> listarTodas();

    List<PlantillaWhatsappResponseDTO> listarPorEstado(String estado);

    PlantillaWhatsappResponseDTO buscarPorId(Long id);

    PlantillaWhatsappResponseDTO actualizar(Long id, PlantillaWhatsappRequestDTO request);

    PlantillaWhatsappResponseDTO enviarAMeta(Long id);

    void eliminar(Long id);
}
