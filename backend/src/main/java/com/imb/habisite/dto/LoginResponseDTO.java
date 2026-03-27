package com.imb.habisite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {

    /** ADMIN | JURADO | POSTULANTE */
    private String rol;

    private String nombre;

    /** Datos completos del postulante (solo cuando rol = POSTULANTE) */
    private PostulanteResponseDTO postulante;
}
