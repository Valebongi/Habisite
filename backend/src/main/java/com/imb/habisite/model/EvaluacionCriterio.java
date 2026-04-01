package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluacion_criterio")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvaluacionCriterio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluacion_id", nullable = false)
    private Evaluacion evaluacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criterio_id", nullable = false)
    private CriterioEvaluacion criterio;

    @Column(nullable = false)
    private Integer puntaje;
}
