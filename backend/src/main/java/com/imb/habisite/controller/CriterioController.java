package com.imb.habisite.controller;

import com.imb.habisite.model.CriterioEvaluacion;
import com.imb.habisite.repository.ConcursoRepository;
import com.imb.habisite.repository.CriterioEvaluacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/criterios")
@RequiredArgsConstructor
public class CriterioController {

    private final CriterioEvaluacionRepository criterioRepo;
    private final ConcursoRepository concursoRepo;

    /** Lista criterios de un concurso */
    @GetMapping("/concurso/{concursoId}")
    public List<Map<String, Object>> listar(@PathVariable Long concursoId) {
        return criterioRepo.findByConcursoIdOrderByOrdenAsc(concursoId)
                .stream().map(this::toMap).toList();
    }

    /** Crear criterio */
    @PostMapping("/concurso/{concursoId}")
    public ResponseEntity<Map<String, Object>> crear(
            @PathVariable Long concursoId, @RequestBody Map<String, Object> body) {
        var concurso = concursoRepo.findById(concursoId).orElse(null);
        if (concurso == null) return ResponseEntity.badRequest().body(Map.of("error", "Concurso no encontrado"));

        CriterioEvaluacion c = CriterioEvaluacion.builder()
                .concurso(concurso)
                .nombre((String) body.getOrDefault("nombre", ""))
                .peso(((Number) body.getOrDefault("peso", 1)).intValue())
                .orden(((Number) body.getOrDefault("orden", 0)).intValue())
                .build();
        return ResponseEntity.ok(toMap(criterioRepo.save(c)));
    }

    /** Eliminar criterio */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!criterioRepo.existsById(id)) return ResponseEntity.notFound().build();
        criterioRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(CriterioEvaluacion c) {
        return Map.of(
                "id", c.getId(),
                "concursoId", c.getConcurso().getId(),
                "nombre", c.getNombre(),
                "peso", c.getPeso(),
                "orden", c.getOrden()
        );
    }
}
