package com.imb.habisite.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ConcursoResponseDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private String bases;
    private OffsetDateTime fechaInicio;
    private OffsetDateTime fechaFin;
    private String estado;
    private OffsetDateTime creadoEn;
}
