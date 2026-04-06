package com.imb.habisite.controller;

import com.imb.habisite.dto.AdminStatsDTO;
import com.imb.habisite.repository.EvaluacionRepository;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.repository.ResolucionRepository;
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
    private final ResolucionRepository resolucionRepository;

    @GetMapping("/stats")
    public AdminStatsDTO stats() {
        var postulantes = postulanteRepository.findAll();
        var evaluaciones = evaluacionRepository.findAll();

        var porEspecialidad = postulantes.stream()
                .collect(Collectors.groupingBy(p -> p.getEspecialidad() != null ? p.getEspecialidad() : "Sin definir", Collectors.counting()));

        var porUniversidad = postulantes.stream()
                .collect(Collectors.groupingBy(p -> p.getUniversidad() != null ? p.getUniversidad() : "Sin definir", Collectors.counting()));

        long infoEnviada = postulanteRepository.countByInfoEnviadaEnIsNotNull();
        long confirmados = postulanteRepository.countByConfirmadoEnIsNotNull();
        long noConfirmados = postulanteRepository.countByInfoEnviadaEnIsNotNullAndConfirmadoEnIsNull();
        double pctConfirmacion = infoEnviada > 0 ? (confirmados * 100.0 / infoEnviada) : 0;

        return AdminStatsDTO.builder()
                .totalPostulantes(postulantes.size())
                .totalEvaluaciones(evaluaciones.size())
                .totalResoluciones(resolucionRepository.count())
                .resolucionesPendientes(resolucionRepository.countByEstado("PENDIENTE"))
                .resolucionesAprobadas(resolucionRepository.countByEstado("APROBADA"))
                .resolucionesRechazadas(resolucionRepository.countByEstado("RECHAZADA"))
                .porEspecialidad(porEspecialidad)
                .porUniversidad(porUniversidad)
                .totalInfoEnviada(infoEnviada)
                .totalConfirmados(confirmados)
                .totalNoConfirmados(noConfirmados)
                .totalRecordatorioEnviado(postulanteRepository.countByRecordatorioEnviadoEnIsNotNull())
                .porcentajeConfirmacion(pctConfirmacion)
                .build();
    }
}
