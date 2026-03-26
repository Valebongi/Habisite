package com.imb.habisite.mapper;

import com.imb.habisite.dto.EvaluacionResponseDTO;
import com.imb.habisite.model.Evaluacion;
import org.springframework.stereotype.Component;

@Component
public class EvaluacionMapper {

    public EvaluacionResponseDTO toResponseDTO(Evaluacion e) {
        return EvaluacionResponseDTO.builder()
                .id(e.getId())
                .postulanteId(e.getPostulante().getId())
                .postulanteNombre(e.getPostulante().getNombres() + " " + e.getPostulante().getApellidos())
                .juradoNombre(e.getJuradoNombre())
                .puntaje(e.getPuntaje())
                .comentario(e.getComentario())
                .evaluadoEn(e.getEvaluadoEn())
                .build();
    }
}
