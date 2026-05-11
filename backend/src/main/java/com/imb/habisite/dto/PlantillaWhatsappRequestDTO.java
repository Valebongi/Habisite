package com.imb.habisite.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantillaWhatsappRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;

    @Builder.Default
    private String uso = "AMBAS";

    @Builder.Default
    private String idioma = "es_AR";

    private String headerTipo;

    private String headerContenido;

    @NotBlank(message = "El body es obligatorio")
    private String body;

    @Size(max = 200, message = "El footer no puede superar los 200 caracteres")
    private String footer;
}
