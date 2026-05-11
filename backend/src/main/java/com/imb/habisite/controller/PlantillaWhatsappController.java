package com.imb.habisite.controller;

import com.imb.habisite.dto.PlantillaWhatsappRequestDTO;
import com.imb.habisite.dto.PlantillaWhatsappResponseDTO;
import com.imb.habisite.service.PlantillaWhatsappService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/plantillas")
@RequiredArgsConstructor
public class PlantillaWhatsappController {

    private final PlantillaWhatsappService service;

    /**
     * POST /api/v1/plantillas
     * Crea una nueva plantilla de WhatsApp.
     */
    @PostMapping
    public ResponseEntity<PlantillaWhatsappResponseDTO> crear(
            @Valid @RequestBody PlantillaWhatsappRequestDTO request) {
        PlantillaWhatsappResponseDTO created = service.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/v1/plantillas
     * Devuelve todas las plantillas.
     */
    @GetMapping
    public ResponseEntity<List<PlantillaWhatsappResponseDTO>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    /**
     * GET /api/v1/plantillas/{id}
     * Devuelve una plantilla por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlantillaWhatsappResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    /**
     * GET /api/v1/plantillas/estado/{estado}
     * Devuelve las plantillas filtradas por estado.
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PlantillaWhatsappResponseDTO>> listarPorEstado(
            @PathVariable String estado) {
        return ResponseEntity.ok(service.listarPorEstado(estado));
    }

    /**
     * PUT /api/v1/plantillas/{id}
     * Actualiza los datos de una plantilla.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PlantillaWhatsappResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PlantillaWhatsappRequestDTO request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    /**
     * POST /api/v1/plantillas/{id}/enviar-meta
     * Envía la plantilla a la API de Meta para su aprobación.
     */
    @PostMapping("/{id}/enviar-meta")
    public ResponseEntity<PlantillaWhatsappResponseDTO> enviarAMeta(@PathVariable Long id) {
        return ResponseEntity.ok(service.enviarAMeta(id));
    }

    /**
     * DELETE /api/v1/plantillas/{id}
     * Elimina una plantilla.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
