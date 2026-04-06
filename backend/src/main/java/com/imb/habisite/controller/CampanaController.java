package com.imb.habisite.controller;

import com.imb.habisite.dto.CampanaInfoRequestDTO;
import com.imb.habisite.dto.CampanaResultDTO;
import com.imb.habisite.service.CampanaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin/campanas")
@RequiredArgsConstructor
public class CampanaController {

    private final CampanaService campanaService;

    /** POST /api/v1/admin/campanas/info-concurso — Paso 2 */
    @PostMapping("/info-concurso")
    public ResponseEntity<CampanaResultDTO> enviarInfoConcurso(
            @Valid @RequestBody CampanaInfoRequestDTO request) {
        return ResponseEntity.ok(campanaService.enviarInfoConcurso(request));
    }

    /** POST /api/v1/admin/campanas/segunda-convocatoria — Paso 3 */
    @PostMapping("/segunda-convocatoria")
    public ResponseEntity<CampanaResultDTO> enviarSegundaConvocatoria() {
        return ResponseEntity.ok(campanaService.enviarSegundaConvocatoria());
    }

    /** POST /api/v1/admin/campanas/bienvenida-confirmados — Envía bienvenida a confirmados pendientes */
    @PostMapping("/bienvenida-confirmados")
    public ResponseEntity<CampanaResultDTO> enviarBienvenidaConfirmados() {
        return ResponseEntity.ok(campanaService.enviarBienvenidaConfirmados());
    }

    /** POST /api/v1/admin/campanas/reenviar/{postulanteId}?tipo=info|2da|bienvenida */
    @PostMapping("/reenviar/{postulanteId}")
    public ResponseEntity<java.util.Map<String, Object>> reenviar(
            @PathVariable Long postulanteId,
            @RequestParam(defaultValue = "info") String tipo) {
        try {
            campanaService.reenviarEmail(postulanteId, tipo);
            return ResponseEntity.ok(java.util.Map.of("ok", true, "mensaje", "Email enviado."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("ok", false, "mensaje", e.getMessage()));
        }
    }
}