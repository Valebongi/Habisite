package com.imb.habisite.service.impl;

import com.imb.habisite.dto.EvaluacionRequestDTO;
import com.imb.habisite.dto.EvaluacionResponseDTO;
import com.imb.habisite.exception.DuplicateResourceException;
import com.imb.habisite.exception.PostulanteNotFoundException;
import com.imb.habisite.mapper.EvaluacionMapper;
import com.imb.habisite.model.Evaluacion;
import com.imb.habisite.repository.EvaluacionRepository;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.service.EvaluacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluacionServiceImpl implements EvaluacionService {

    private final EvaluacionRepository repository;
    private final PostulanteRepository postulanteRepository;
    private final EvaluacionMapper mapper;

    @Override
    @Transactional
    public EvaluacionResponseDTO crear(EvaluacionRequestDTO request) {
        var postulante = postulanteRepository.findById(request.getPostulanteId())
                .orElseThrow(() -> new PostulanteNotFoundException(
                        "Postulante no encontrado con ID: " + request.getPostulanteId()));

        if (repository.existsByPostulanteIdAndJuradoNombre(request.getPostulanteId(), request.getJuradoNombre())) {
            throw new DuplicateResourceException(
                    "El jurado ya evaluó a este postulante");
        }

        Evaluacion ev = Evaluacion.builder()
                .postulante(postulante)
                .juradoNombre(request.getJuradoNombre().trim())
                .puntaje(request.getPuntaje())
                .comentario(request.getComentario())
                .build();

        Evaluacion saved = repository.save(ev);
        log.info("Evaluación creada ID: {}", saved.getId());
        return mapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluacionResponseDTO> listarTodas() {
        return repository.findAll().stream().map(mapper::toResponseDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluacionResponseDTO> listarPorPostulante(Long postulanteId) {
        return repository.findByPostulanteId(postulanteId).stream().map(mapper::toResponseDTO).toList();
    }
}
