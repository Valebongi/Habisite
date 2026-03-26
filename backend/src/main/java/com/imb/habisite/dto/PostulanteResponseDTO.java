package com.imb.habisite.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostulanteResponseDTO {

    private Long id;
    private String nombres;
    private String apellidos;
    private String dni;
    private String celular;
    private String universidad;
    private String correoElectronico;
    private String especialidad;
    private OffsetDateTime creadoEn;
}
