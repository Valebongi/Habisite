package com.imb.habisite.service;

import com.imb.habisite.dto.EvaluacionRequestDTO;
import com.imb.habisite.dto.EvaluacionResponseDTO;

import java.util.List;

public interface EvaluacionService {

    EvaluacionResponseDTO crear(EvaluacionRequestDTO request);

    List<EvaluacionResponseDTO> listarTodas();

    List<EvaluacionResponseDTO> listarPorPostulante(Long postulanteId);
}
