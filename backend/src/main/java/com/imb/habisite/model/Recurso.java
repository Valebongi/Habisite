package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "recurso")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(name = "archivo_nombre", nullable = false, length = 255)
    private String archivoNombre;

    @Lob
    @Column(name = "archivo_datos", nullable = false)
    private byte[] archivoDatos;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column
    private Long tamanio;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @PrePersist
    void prePersist() { if (creadoEn == null) creadoEn = OffsetDateTime.now(); }
}
