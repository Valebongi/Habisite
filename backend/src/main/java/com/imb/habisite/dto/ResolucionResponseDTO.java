package com.imb.habisite.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ResolucionResponseDTO {
    private Long id;
    private Long postulanteId;
    private String postulanteNombre;
    private Long concursoId;
    private String concursoTitulo;
    private String titulo;
    private String descripcion;
    private String archivoNombre;
    private boolean tieneArchivo;
    private String urlExterno;
    private String estado;
    private String tipoEntrega;
    private String propuesta;
    private OffsetDateTime creadoEn;
}
