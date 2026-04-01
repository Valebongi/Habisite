package com.imb.habisite.controller;

import com.imb.habisite.service.CampanaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1/confirmacion")
@RequiredArgsConstructor
public class ConfirmacionController {

    private final CampanaService campanaService;

    /** GET /api/v1/confirmacion?token=UUID — link directo desde el email (backward compat) */
    @GetMapping
    public ResponseEntity<Map<String, Object>> confirmar(@RequestParam String token) {
        try {
            campanaService.confirmarParticipacion(token);
            return ResponseEntity.ok(Map.of(
                    "confirmado", true,
                    "mensaje", "Tu participacion ha sido confirmada exitosamente."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "confirmado", false,
                    "mensaje", e.getMessage()
            ));
        }
    }

    /** GET /api/v1/confirmacion/verificar?token=UUID — verifica si el token es válido y si ya confirmó */
    @GetMapping("/verificar")
    public ResponseEntity<Map<String, Object>> verificar(@RequestParam String token) {
        try {
            boolean confirmado = campanaService.estaConfirmado(token);
            return ResponseEntity.ok(Map.of(
                    "confirmado", confirmado,
                    "mensaje", confirmado
                            ? "Tu participacion ya fue confirmada anteriormente."
                            : "Token valido. Completa tus datos para confirmar."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "confirmado", false,
                    "mensaje", e.getMessage()
            ));
        }
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

        try {
            campanaService.confirmarConDatos(token, dni, celular, especialidad);
            return ResponseEntity.ok(Map.of(
                    "confirmado", true,
                    "mensaje", "Tu inscripcion oficial fue confirmada exitosamente. Revisa tu email."
            ));
        } catch (IllegalArgumentException e) {
            log.warn("Error en confirmacion con datos: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "confirmado", false,
                    "mensaje", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado en confirmacion: ", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "confirmado", false,
                    "mensaje", "Error interno al procesar la confirmacion. Intenta de nuevo."
            ));
        }
    }
}
