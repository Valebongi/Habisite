package com.imb.habisite.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionRequestDTO {

    @NotNull
    private Long postulanteId;

    @NotBlank
    @Size(max = 100)
    private String juradoNombre;

    @NotNull
    @Min(1) @Max(10)
    private Integer puntaje;

    private String comentario;
}
