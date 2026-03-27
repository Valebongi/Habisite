package com.imb.habisite.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "soporte_ticket")
@Data
@NoArgsConstructor
public class SoporteTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 20)
    private String dni;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(nullable = false)
    private boolean resuelto = false;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @PrePersist
    void prePersist() {
        if (creadoEn == null) creadoEn = OffsetDateTime.now();
    }
}
