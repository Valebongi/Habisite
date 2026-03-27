package com.imb.habisite.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDTO {

    private long totalPostulantes;
    private long totalEvaluaciones;
    private long totalResoluciones;
    private long resolucionesPendientes;
    private long resolucionesAprobadas;
    private long resolucionesRechazadas;
    private Map<String, Long> porEspecialidad;
    private Map<String, Long> porUniversidad;
}
