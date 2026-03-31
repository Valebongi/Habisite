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

    /** GET /api/v1/confirmacion?token=UUID — link directo desde el email (backward compat) */
    @GetMapping
    public ResponseEntity<Map<String, Object>> confirmar(@RequestParam String token) {
        campanaService.confirmarParticipacion(token);
        return ResponseEntity.ok(Map.of(
                "confirmado", true,
                "mensaje", "Tu participacion ha sido confirmada exitosamente."
        ));
    }

    /** GET /api/v1/confirmacion/verificar?token=UUID — verifica si el token es válido y si ya confirmó */
    @GetMapping("/verificar")
    public ResponseEntity<Map<String, Object>> verificar(@RequestParam String token) {
        boolean confirmado = campanaService.estaConfirmado(token);
        return ResponseEntity.ok(Map.of(
                "confirmado", confirmado,
                "mensaje", confirmado
                        ? "Tu participacion ya fue confirmada anteriormente."
                        : "Token valido. Completa tus datos para confirmar."
        ));
    }

    /** POST /api/v1/confirmacion — inscripción oficial con datos duros (DNI, celular, especialidad) */
    @PostMapping
    public ResponseEntity<Map<String, Object>> confirmarConDatos(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String dni = body.get("dni");
        String celular = body.get("celular");
        String especialidad = body.get("especialidad");

        if (token == null || dni == null || celular == null || especialidad == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "confirmado", false,
                    "mensaje", "Faltan datos obligatorios: token, dni, celular, especialidad."
            ));
        }

        campanaService.confirmarConDatos(token, dni, celular, especialidad);
        return ResponseEntity.ok(Map.of(
                "confirmado", true,
                "mensaje", "Tu inscripcion oficial fue confirmada exitosamente. Revisa tu email."
        ));
    }
}
