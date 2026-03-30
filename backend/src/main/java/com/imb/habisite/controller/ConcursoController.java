package com.imb.habisite.controller;

import com.imb.habisite.dto.ConcursoResponseDTO;
import com.imb.habisite.model.Concurso;
import com.imb.habisite.repository.ConcursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/concursos")
@RequiredArgsConstructor
public class ConcursoController {

    private final ConcursoRepository concursoRepo;

    @GetMapping
    public List<ConcursoResponseDTO> listar() {
        return concursoRepo.findAllByOrderByFechaFinAsc()
                .stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConcursoResponseDTO> obtener(@PathVariable long id) {
        return concursoRepo.findById(id)
                .map(c -> ResponseEntity.ok(toDTO(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ConcursoResponseDTO> crear(@RequestBody ConcursoResponseDTO dto) {
        Concurso c = new Concurso();
        c.setTitulo(dto.getTitulo());
        c.setDescripcion(dto.getDescripcion());
        c.setBases(dto.getBases());
        c.setFechaInicio(dto.getFechaInicio());
        c.setFechaFin(dto.getFechaFin());
        c.setEstado(dto.getEstado() != null ? dto.getEstado() : "ACTIVO");
        return ResponseEntity.ok(toDTO(concursoRepo.save(c)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConcursoResponseDTO> actualizar(
            @PathVariable long id, @RequestBody ConcursoResponseDTO dto) {
        return concursoRepo.findById(id).map(c -> {
            if (dto.getTitulo() != null)      c.setTitulo(dto.getTitulo());
            if (dto.getDescripcion() != null)  c.setDescripcion(dto.getDescripcion());
            if (dto.getBases() != null)        c.setBases(dto.getBases());
            if (dto.getFechaInicio() != null)  c.setFechaInicio(dto.getFechaInicio());
            if (dto.getFechaFin() != null)     c.setFechaFin(dto.getFechaFin());
            if (dto.getEstado() != null)       c.setEstado(dto.getEstado());
            return ResponseEntity.ok(toDTO(concursoRepo.save(c)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ConcursoResponseDTO> cambiarEstado(
            @PathVariable long id, @RequestParam String estado) {
        return concursoRepo.findById(id).map(c -> {
            c.setEstado(estado);
            return ResponseEntity.ok(toDTO(concursoRepo.save(c)));
        }).orElse(ResponseEntity.notFound().build());
    }

    private ConcursoResponseDTO toDTO(Concurso c) {
        ConcursoResponseDTO dto = new ConcursoResponseDTO();
        dto.setId(c.getId());
        dto.setTitulo(c.getTitulo());
        dto.setDescripcion(c.getDescripcion());
        dto.setBases(c.getBases());
        dto.setFechaInicio(c.getFechaInicio());
        dto.setFechaFin(c.getFechaFin());
        dto.setEstado(c.getEstado());
        dto.setCreadoEn(c.getCreadoEn());
        return dto;
    }
}
