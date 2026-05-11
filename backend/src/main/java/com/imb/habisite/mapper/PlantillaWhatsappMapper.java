package com.imb.habisite.mapper;

import com.imb.habisite.dto.PlantillaWhatsappRequestDTO;
import com.imb.habisite.dto.PlantillaWhatsappResponseDTO;
import com.imb.habisite.model.PlantillaWhatsapp;
import org.springframework.stereotype.Component;

@Component
public class PlantillaWhatsappMapper {

    private static String trim(String s) { return s != null ? s.trim() : null; }

    public PlantillaWhatsapp toEntity(PlantillaWhatsappRequestDTO dto) {
        return PlantillaWhatsapp.builder()
                .nombre(dto.getNombre().trim())
                .categoria(dto.getCategoria().trim())
                .uso(dto.getUso() != null ? dto.getUso().trim() : "AMBAS")
                .idioma(dto.getIdioma() != null ? dto.getIdioma().trim() : "es_AR")
                .headerTipo(trim(dto.getHeaderTipo()))
                .headerContenido(trim(dto.getHeaderContenido()))
                .body(dto.getBody().trim())
                .footer(trim(dto.getFooter()))
                .botones(dto.getBotones())
                .estado("BORRADOR")
                .build();
    }

    public PlantillaWhatsappResponseDTO toResponseDTO(PlantillaWhatsapp entity) {
        return PlantillaWhatsappResponseDTO.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .categoria(entity.getCategoria())
                .uso(entity.getUso())
                .idioma(entity.getIdioma())
                .headerTipo(entity.getHeaderTipo())
                .headerContenido(entity.getHeaderContenido())
                .body(entity.getBody())
                .footer(entity.getFooter())
                .estado(entity.getEstado())
                .metaTemplateId(entity.getMetaTemplateId())
                .motivoRechazo(entity.getMotivoRechazo())
                .botones(entity.getBotones())
                .creadoEn(entity.getCreadoEn())
                .actualizadoEn(entity.getActualizadoEn())
                .build();
    }
}
