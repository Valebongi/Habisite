package com.imb.habisite.service.impl;

import com.imb.habisite.service.CampanaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BienvenidaScheduler {

    private final CampanaService campanaService;

    /** Cada hora, envía bienvenida a confirmados que aún no la recibieron. */
    @Scheduled(fixedRate = 3600000) // 1 hora en ms
    public void enviarBienvenidaPendientes() {
        log.debug("Scheduler: verificando confirmados sin bienvenida...");
        try {
            var result = campanaService.enviarBienvenidaConfirmados();
            if (result.getEmailsEnviados() > 0) {
                log.info("Scheduler: {}", result.getMensaje());
            }
        } catch (Exception e) {
            log.error("Scheduler error: {}", e.getMessage());
        }
    }
}
