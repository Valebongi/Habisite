package com.imb.habisite.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostulanteRequestDTO {

    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 100, message = "Los nombres no pueden superar los 100 caracteres")
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 100, message = "Los apellidos no pueden superar los 100 caracteres")
    private String apellidos;

    // Opcional en pre-registro — se completa en la confirmación
    @Size(max = 8, message = "El DNI no puede superar los 8 caracteres")
    private String dni;

    // Opcional en pre-registro
    @Size(max = 15, message = "El celular no puede superar los 15 caracteres")
    private String celular;

    @NotBlank(message = "La universidad es obligatoria")
    @Size(max = 150, message = "El nombre de la universidad no puede superar los 150 caracteres")
    private String universidad;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico no tiene un formato válido")
    @Size(max = 150)
    private String correoElectronico;

    // Opcional en pre-registro — se completa en la confirmación
    @Size(max = 100, message = "La especialidad no puede superar los 100 caracteres")
    private String especialidad;
}
