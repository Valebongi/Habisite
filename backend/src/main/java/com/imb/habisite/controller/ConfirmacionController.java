package com.imb.habisite.controller;

import com.imb.habisite.service.CampanaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/confirmacion")
@RequiredArgsConstructor
public class ConfirmacionController {

    private final CampanaService campanaService;

    /** GET /api/v1/confirmacion?token=UUID — link desde el email del postulante */
    @GetMapping
    public ResponseEntity<Map<String, Object>> confirmar(@RequestParam String token) {
        campanaService.confirmarParticipacion(token);
        return ResponseEntity.ok(Map.of(
                "confirmado", true,
                "mensaje", "Tu participacion ha sido confirmada exitosamente."
        ));
    }
}
