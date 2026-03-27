package com.imb.habisite.controller;

import com.imb.habisite.dto.PostulanteRequestDTO;
import com.imb.habisite.dto.PostulanteResponseDTO;
import com.imb.habisite.service.PostulanteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/postulantes")
@RequiredArgsConstructor
public class PostulanteController {

    private final PostulanteService service;

    /**
     * POST /api/v1/postulantes
     * Registra un nuevo postulante.
     */
    @PostMapping
    public ResponseEntity<PostulanteResponseDTO> registrar(
            @Valid @RequestBody PostulanteRequestDTO request) {
        PostulanteResponseDTO created = service.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/v1/postulantes
     * Devuelve todos los postulantes.
     */
    @GetMapping
    public ResponseEntity<List<PostulanteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    /**
     * GET /api/v1/postulantes/{id}
     * Devuelve un postulante por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostulanteResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    /**
     * GET /api/v1/postulantes/dni/{dni}
     * Devuelve un postulante por su DNI.
     */
    @GetMapping("/dni/{dni}")
    public ResponseEntity<PostulanteResponseDTO> buscarPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(service.buscarPorDni(dni));
    }

    /**
     * PUT /api/v1/postulantes/{id}
     * Actualiza los datos de un postulante.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PostulanteResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PostulanteRequestDTO request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    /**
     * POST /api/v1/postulantes/{id}/regenerar-clave
     * Genera una nueva contraseña y la envía por email al postulante.
     */
    @PostMapping("/{id}/regenerar-clave")
    public ResponseEntity<Void> regenerarClave(@PathVariable Long id) {
        service.regenerarClave(id);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/v1/postulantes/recuperar-clave
     * Envía una nueva contraseña al email del DNI indicado.
     * Siempre responde 200 para no exponer si el DNI existe.
     */
    @PostMapping("/recuperar-clave")
    public ResponseEntity<Void> recuperarClave(@RequestBody java.util.Map<String, String> body) {
        String dni = body.getOrDefault("dni", "").trim();
        if (!dni.isBlank()) service.recuperarClavePorDni(dni);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/v1/postulantes/{id}
     * Elimina un postulante.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
