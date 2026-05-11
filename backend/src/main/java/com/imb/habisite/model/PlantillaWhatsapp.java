package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "plantilla_whatsapp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlantillaWhatsapp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100, unique = true)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String categoria;

    @Column(nullable = false, length = 20)
    private String uso;

    @Column(nullable = false, length = 10)
    private String idioma;

    @Column(name = "header_tipo", length = 10)
    private String headerTipo;

    @Column(name = "header_contenido", columnDefinition = "TEXT")
    private String headerContenido;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(length = 200)
    private String footer;

    @Column(columnDefinition = "TEXT")
    private String botones;

    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "meta_template_id", length = 100)
    private String metaTemplateId;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn;

    @PrePersist
    private void prePersist() {
        this.creadoEn = OffsetDateTime.now();
        this.actualizadoEn = OffsetDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.actualizadoEn = OffsetDateTime.now();
    }
}
