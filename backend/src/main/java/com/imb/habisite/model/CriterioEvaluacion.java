package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "criterio_evaluacion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CriterioEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concurso_id", nullable = false)
    private Concurso concurso;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Builder.Default
    @Column(nullable = false)
    private Integer peso = 1;

    @Builder.Default
    @Column(nullable = false)
    private Integer orden = 0;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @PrePersist
    private void prePersist() { this.creadoEn = OffsetDateTime.now(); }
}
