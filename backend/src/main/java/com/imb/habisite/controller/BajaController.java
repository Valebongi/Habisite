package com.imb.habisite.controller;

import com.imb.habisite.repository.PostulanteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1/baja")
@RequiredArgsConstructor
public class BajaController {

    private final PostulanteRepository postulanteRepo;

    /** GET /api/v1/baja?token=UUID — link desde el footer del email para darse de baja */
    @GetMapping
    public ResponseEntity<Map<String, Object>> confirmarBaja(@RequestParam String token) {
        return postulanteRepo.findByTokenConfirmacion(token).map(p -> {
            log.info("Baja solicitada por postulante: {} {} (DNI: {})", p.getNombres(), p.getApellidos(), p.getDni());
            postulanteRepo.delete(p);
            return ResponseEntity.ok(Map.<String, Object>of(
                    "baja", true,
                    "mensaje", "Tu inscripción fue cancelada y tus datos fueron eliminados."
            ));
        }).orElse(ResponseEntity.badRequest().body(Map.of(
                "baja", false,
                "mensaje", "El enlace no es válido o ya fue utilizado."
        )));
    }
}
