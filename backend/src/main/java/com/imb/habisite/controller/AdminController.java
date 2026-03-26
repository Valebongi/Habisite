package com.imb.habisite.controller;

import com.imb.habisite.dto.AdminStatsDTO;
import com.imb.habisite.repository.EvaluacionRepository;
import com.imb.habisite.repository.PostulanteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PostulanteRepository postulanteRepository;
    private final EvaluacionRepository evaluacionRepository;

    @GetMapping("/stats")
    public AdminStatsDTO stats() {
        var postulantes = postulanteRepository.findAll();
        var evaluaciones = evaluacionRepository.findAll();

        var porEspecialidad = postulantes.stream()
                .collect(Collectors.groupingBy(p -> p.getEspecialidad(), Collectors.counting()));

        var porUniversidad = postulantes.stream()
                .collect(Collectors.groupingBy(p -> p.getUniversidad(), Collectors.counting()));

        return AdminStatsDTO.builder()
                .totalPostulantes(postulantes.size())
                .totalEvaluaciones(evaluaciones.size())
                .porEspecialidad(porEspecialidad)
                .porUniversidad(porUniversidad)
                .build();
    }
}
