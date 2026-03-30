package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "publicacion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Publicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(nullable = false, length = 100)
    private String autor;

    @Column(nullable = false)
    private boolean publicado;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @PrePersist
    void prePersist() { if (creadoEn == null) creadoEn = OffsetDateTime.now(); }
}
