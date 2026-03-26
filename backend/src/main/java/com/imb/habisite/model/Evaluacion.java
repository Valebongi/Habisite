package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "evaluacion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "postulante_id", nullable = false)
    private Postulante postulante;

    @Column(name = "jurado_nombre", nullable = false, length = 100)
    private String juradoNombre;

    @Column(nullable = false)
    private Integer puntaje;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "evaluado_en", nullable = false)
    private OffsetDateTime evaluadoEn;

    @PrePersist
    void prePersist() {
        this.evaluadoEn = OffsetDateTime.now();
    }
}
