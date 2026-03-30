package com.imb.habisite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampanaInfoRequestDTO {

    @NotBlank(message = "La URL del webinar es obligatoria")
    private String webinarUrl;

    @NotNull(message = "La fecha del webinar es obligatoria")
    private OffsetDateTime webinarFecha;

    @NotBlank(message = "La URL del canal es obligatoria")
    private String canalUrl;

    private String canalNombre; // Discord, WhatsApp, Telegram, etc.
}
