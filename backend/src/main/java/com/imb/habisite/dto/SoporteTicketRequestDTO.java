package com.imb.habisite.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SoporteTicketRequestDTO {

    @NotBlank
    private String nombre;

    private String dni;

    @NotBlank
    private String mensaje;
}
