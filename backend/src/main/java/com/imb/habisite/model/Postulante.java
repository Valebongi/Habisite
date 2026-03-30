package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "postulante")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Postulante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(nullable = false, length = 8, unique = true)
    private String dni;

    @Column(nullable = false, length = 15)
    private String celular;

    @Column(nullable = false, length = 150)
    private String universidad;

    @Column(name = "correo_electronico", nullable = false, length = 150, unique = true)
    private String correoElectronico;

    @Column(nullable = false, length = 100)
    private String especialidad;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @Column(name = "token_confirmacion", length = 36, unique = true)
    private String tokenConfirmacion;

    @Column(name = "info_enviada_en")
    private OffsetDateTime infoEnviadaEn;

    @Column(name = "confirmado_en")
    private OffsetDateTime confirmadoEn;

    @Column(name = "recordatorio_enviado_en")
    private OffsetDateTime recordatorioEnviadoEn;

    @PrePersist
    private void prePersist() {
        this.creadoEn = OffsetDateTime.now();
    }
}
