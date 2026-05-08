package com.imb.habisite.mapper;

import com.imb.habisite.dto.PostulanteRequestDTO;
import com.imb.habisite.dto.PostulanteResponseDTO;
import com.imb.habisite.model.Postulante;
import org.springframework.stereotype.Component;

@Component
public class PostulanteMapper {

    private static String trim(String s) { return s != null ? s.trim() : null; }

    public Postulante toEntity(PostulanteRequestDTO dto) {
        return Postulante.builder()
                .nombres(dto.getNombres().trim())
                .apellidos(dto.getApellidos().trim())
                .dni(trim(dto.getDni()))
                .celular(trim(dto.getCelular()))
                .universidad(trim(dto.getUniversidad()))
                .correoElectronico(dto.getCorreoElectronico().trim().toLowerCase())
                .especialidad(trim(dto.getEspecialidad()))
                .sexo(trim(dto.getSexo()))
                .profesion(trim(dto.getProfesion()))
                .pais(trim(dto.getPais()))
                .provincia(trim(dto.getProvincia()))
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
                .sexo(entity.getSexo())
                .profesion(entity.getProfesion())
                .pais(entity.getPais())
                .provincia(entity.getProvincia())
                .creadoEn(entity.getCreadoEn())
                .infoEnviadaEn(entity.getInfoEnviadaEn())
                .confirmadoEn(entity.getConfirmadoEn())
                .recordatorioEnviadoEn(entity.getRecordatorioEnviadoEn())
                .build();
    }
}
