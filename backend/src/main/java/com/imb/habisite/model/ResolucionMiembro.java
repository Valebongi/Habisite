package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "resolucion_miembro")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResolucionMiembro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolucion_id", nullable = false)
    private Resolucion resolucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postulante_id", nullable = false)
    private Postulante postulante;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @PrePersist
    private void prePersist() { this.creadoEn = OffsetDateTime.now(); }
}
