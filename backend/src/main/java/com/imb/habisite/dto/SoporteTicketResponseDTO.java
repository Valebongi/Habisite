package com.imb.habisite.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class SoporteTicketResponseDTO {
    private Long id;
    private String nombre;
    private String dni;
    private String mensaje;
    private boolean resuelto;
    private OffsetDateTime creadoEn;
}
