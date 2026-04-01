package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "equipo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postulante_id", nullable = false)
    private Postulante postulante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "miembro_id")
    private Postulante miembro;

    @Column(nullable = false, length = 8)
    private String dni;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 15)
    private String celular;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @PrePersist
    private void prePersist() { this.creadoEn = OffsetDateTime.now(); }
}
