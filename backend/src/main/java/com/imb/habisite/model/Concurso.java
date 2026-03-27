package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "concurso")
@Data
@NoArgsConstructor
public class Concurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TEXT")
    private String bases;

    @Column(name = "fecha_inicio", nullable = false)
    private OffsetDateTime fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private OffsetDateTime fechaFin;

    @Column(nullable = false, length = 20)
    private String estado = "ACTIVO";

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @PrePersist
    void prePersist() {
        if (creadoEn == null) creadoEn = OffsetDateTime.now();
    }
}
