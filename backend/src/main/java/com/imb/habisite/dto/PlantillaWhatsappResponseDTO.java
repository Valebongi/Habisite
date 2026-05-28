package com.imb.habisite.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantillaWhatsappResponseDTO {

    private Long id;
    private String nombre;
    private String categoria;
    private String uso;
    private String idioma;
    private String headerTipo;
    private String headerContenido;
    private String body;
    private String footer;
    private List<Map<String, String>> botones;
    private String estado;
    private String metaTemplateId;
    private String motivoRechazo;
    private OffsetDateTime creadoEn;
    private OffsetDateTime actualizadoEn;
}
