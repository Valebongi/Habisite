package com.imb.habisite.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionResponseDTO {

    private Long id;
    private Long postulanteId;
    private String postulanteNombre;
    private String juradoNombre;
    private Integer puntaje;
    private String comentario;
    private OffsetDateTime evaluadoEn;
}
