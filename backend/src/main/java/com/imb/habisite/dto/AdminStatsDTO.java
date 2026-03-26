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
    private Map<String, Long> porEspecialidad;
    private Map<String, Long> porUniversidad;
}
