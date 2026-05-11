package com.imb.habisite.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.imb.habisite.dto.PlantillaWhatsappRequestDTO;
import com.imb.habisite.dto.PlantillaWhatsappResponseDTO;
import com.imb.habisite.model.PlantillaWhatsapp;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class PlantillaWhatsappMapper {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final TypeReference<List<Map<String, String>>> BOTONES_TYPE = new TypeReference<>() {};

    private static String trim(String s) { return s != null ? s.trim() : null; }

    public String serializarBotones(List<Map<String, String>> botones) {
        if (botones == null || botones.isEmpty()) return null;
        try { return JSON.writeValueAsString(botones); }
        catch (Exception e) { return null; }
    }

    public List<Map<String, String>> deserializarBotonesPublic(String json) {
        if (json == null || json.isBlank()) return null;
        try { return JSON.readValue(json, BOTONES_TYPE); }
        catch (Exception e) { return null; }
    }

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
                .botones(serializarBotones(dto.getBotones()))
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
                .botones(deserializarBotonesPublic(entity.getBotones()))
                .estado(entity.getEstado())
                .metaTemplateId(entity.getMetaTemplateId())
                .motivoRechazo(entity.getMotivoRechazo())
                .creadoEn(entity.getCreadoEn())
                .actualizadoEn(entity.getActualizadoEn())
                .build();
    }
}
