package com.imb.habisite.mapper;

import com.imb.habisite.dto.PostulanteRequestDTO;
import com.imb.habisite.dto.PostulanteResponseDTO;
import com.imb.habisite.model.Postulante;
import org.springframework.stereotype.Component;

@Component
public class PostulanteMapper {

    public Postulante toEntity(PostulanteRequestDTO dto) {
        return Postulante.builder()
                .nombres(dto.getNombres().trim())
                .apellidos(dto.getApellidos().trim())
                .dni(dto.getDni().trim())
                .celular(dto.getCelular().trim())
                .universidad(dto.getUniversidad().trim())
                .correoElectronico(dto.getCorreoElectronico().trim().toLowerCase())
                .especialidad(dto.getEspecialidad().trim())
                .build();
    }

    public PostulanteResponseDTO toResponseDTO(Postulante entity) {
        return PostulanteResponseDTO.builder()
                .id(entity.getId())
                .nombres(entity.getNombres())
                .apellidos(entity.getApellidos())
                .dni(entity.getDni())
                .celular(entity.getCelular())
                .universidad(entity.getUniversidad())
                .correoElectronico(entity.getCorreoElectronico())
                .especialidad(entity.getEspecialidad())
                .creadoEn(entity.getCreadoEn())
                .infoEnviadaEn(entity.getInfoEnviadaEn())
                .confirmadoEn(entity.getConfirmadoEn())
                .recordatorioEnviadoEn(entity.getRecordatorioEnviadoEn())
                .build();
    }
}
