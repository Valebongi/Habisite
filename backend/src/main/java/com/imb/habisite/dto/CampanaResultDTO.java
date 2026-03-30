package com.imb.habisite.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampanaResultDTO {

    private int emailsEnviados;
    private int emailsOmitidos;
    private String mensaje;
}
