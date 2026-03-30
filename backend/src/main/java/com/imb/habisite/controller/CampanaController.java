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
}
