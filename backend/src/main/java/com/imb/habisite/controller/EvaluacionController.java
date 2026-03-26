package com.imb.habisite.controller;

import com.imb.habisite.dto.EvaluacionRequestDTO;
import com.imb.habisite.dto.EvaluacionResponseDTO;
import com.imb.habisite.service.EvaluacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/evaluaciones")
@RequiredArgsConstructor
public class EvaluacionController {

    private final EvaluacionService service;

    @PostMapping
    public ResponseEntity<EvaluacionResponseDTO> crear(@Valid @RequestBody EvaluacionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @GetMapping
    public List<EvaluacionResponseDTO> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/postulante/{postulanteId}")
    public List<EvaluacionResponseDTO> listarPorPostulante(@PathVariable Long postulanteId) {
        return service.listarPorPostulante(postulanteId);
    }
}
