package com.imb.habisite.service.impl;

import com.imb.habisite.dto.PostulanteRequestDTO;
import com.imb.habisite.dto.PostulanteResponseDTO;
import com.imb.habisite.exception.DuplicateResourceException;
import com.imb.habisite.exception.PostulanteNotFoundException;
import com.imb.habisite.mapper.PostulanteMapper;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.service.PostulanteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostulanteServiceImpl implements PostulanteService {

    private final PostulanteRepository repository;
    private final PostulanteMapper mapper;

    @Override
    @Transactional
    public PostulanteResponseDTO registrar(PostulanteRequestDTO request) {
        log.debug("Registrando postulante con DNI: {}", request.getDni());

        if (repository.existsByDni(request.getDni())) {
            throw new DuplicateResourceException("Ya existe un postulante con el DNI: " + request.getDni());
        }
        if (repository.existsByCorreoElectronico(request.getCorreoElectronico().toLowerCase())) {
            throw new DuplicateResourceException("Ya existe un postulante con el correo: " + request.getCorreoElectronico());
        }

        Postulante saved = repository.save(mapper.toEntity(request));
        log.info("Postulante registrado con ID: {}", saved.getId());
        return mapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostulanteResponseDTO> listarTodos() {
        log.debug("Listando todos los postulantes");
        return repository.findAll()
                .stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PostulanteResponseDTO buscarPorId(Long id) {
        log.debug("Buscando postulante con ID: {}", id);
        return repository.findById(id)
                .map(mapper::toResponseDTO)
                .orElseThrow(() -> new PostulanteNotFoundException("Postulante no encontrado con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public PostulanteResponseDTO buscarPorDni(String dni) {
        log.debug("Buscando postulante con DNI: {}", dni);
        return repository.findByDni(dni)
                .map(mapper::toResponseDTO)
                .orElseThrow(() -> new PostulanteNotFoundException("Postulante no encontrado con DNI: " + dni));
    }

    @Override
    @Transactional
    public PostulanteResponseDTO actualizar(Long id, PostulanteRequestDTO request) {
        log.debug("Actualizando postulante con ID: {}", id);

        Postulante existente = repository.findById(id)
                .orElseThrow(() -> new PostulanteNotFoundException("Postulante no encontrado con ID: " + id));

        // Validar unicidad de DNI si cambió
        if (!existente.getDni().equals(request.getDni()) && repository.existsByDni(request.getDni())) {
            throw new DuplicateResourceException("Ya existe un postulante con el DNI: " + request.getDni());
        }

        // Validar unicidad de correo si cambió
        String correoNormalizado = request.getCorreoElectronico().toLowerCase();
        if (!existente.getCorreoElectronico().equals(correoNormalizado)
                && repository.existsByCorreoElectronico(correoNormalizado)) {
            throw new DuplicateResourceException("Ya existe un postulante con el correo: " + request.getCorreoElectronico());
        }

        existente.setNombres(request.getNombres().trim());
        existente.setApellidos(request.getApellidos().trim());
        existente.setDni(request.getDni().trim());
        existente.setCelular(request.getCelular().trim());
        existente.setUniversidad(request.getUniversidad().trim());
        existente.setCorreoElectronico(correoNormalizado);
        existente.setEspecialidad(request.getEspecialidad().trim());

        Postulante updated = repository.save(existente);
        log.info("Postulante actualizado con ID: {}", updated.getId());
        return mapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        log.debug("Eliminando postulante con ID: {}", id);
        if (!repository.existsById(id)) {
            throw new PostulanteNotFoundException("Postulante no encontrado con ID: " + id);
        }
        repository.deleteById(id);
        log.info("Postulante eliminado con ID: {}", id);
    }
}
