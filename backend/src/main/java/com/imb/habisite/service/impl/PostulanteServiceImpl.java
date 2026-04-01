package com.imb.habisite.service.impl;

import com.imb.habisite.dto.PostulanteRequestDTO;
import com.imb.habisite.dto.PostulanteResponseDTO;
import com.imb.habisite.exception.DuplicateResourceException;
import com.imb.habisite.exception.PostulanteNotFoundException;
import com.imb.habisite.mapper.PostulanteMapper;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.service.EmailService;
import com.imb.habisite.service.PostulanteService;
import com.imb.habisite.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostulanteServiceImpl implements PostulanteService {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private final PostulanteRepository repository;
    private final PostulanteMapper mapper;
    private final EmailService emailService;

    @Override
    @Transactional
    public PostulanteResponseDTO registrar(PostulanteRequestDTO request) {
        log.debug("Registrando postulante con correo: {}", request.getCorreoElectronico());

        // DNI puede ser vacío en pre-registro; solo validar unicidad si tiene valor
        String dni = request.getDni() != null ? request.getDni().trim() : "";
        if (!dni.isEmpty() && repository.existsByDni(dni)) {
            throw new DuplicateResourceException("Ya existe un postulante con el DNI: " + dni);
        }
        if (repository.existsByCorreoElectronico(request.getCorreoElectronico().toLowerCase())) {
            throw new DuplicateResourceException("Ya existe un postulante con el correo: " + request.getCorreoElectronico());
        }

        Postulante entity = mapper.toEntity(request);
        // Si DNI vacío, setear null para que no choque con UNIQUE constraint
        if (dni.isEmpty()) {
            entity.setDni(null);
        }
        if (entity.getCelular() != null && entity.getCelular().isBlank()) {
            entity.setCelular(null);
        }
        if (entity.getEspecialidad() != null && entity.getEspecialidad().isBlank()) {
            entity.setEspecialidad(null);
        }

        // Solo generar credenciales si tiene DNI (inscripción completa)
        if (entity.getDni() != null) {
            String plainPassword = PasswordGenerator.generate();
            entity.setPasswordHash(ENCODER.encode(plainPassword));
            Postulante saved = repository.save(entity);
            log.info("Postulante registrado con ID: {} (inscripcion completa)", saved.getId());
            emailService.enviarCredenciales(saved, plainPassword);
            return mapper.toResponseDTO(saved);
        }

        // Pre-registro sin DNI — no genera credenciales
        Postulante saved = repository.save(entity);
        log.info("Pre-registro con ID: {} (sin DNI, pendiente confirmacion)", saved.getId());
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
    public void regenerarClave(Long id) {
        Postulante p = repository.findById(id)
                .orElseThrow(() -> new PostulanteNotFoundException("Postulante no encontrado con ID: " + id));

        String plainPassword = PasswordGenerator.generate();
        p.setPasswordHash(ENCODER.encode(plainPassword));
        repository.save(p);

        emailService.enviarCredenciales(p, plainPassword);
        log.info("Clave regenerada y enviada por email para postulante ID: {}", id);
    }

    @Override
    @Transactional
    public void recuperarClavePorDni(String dni) {
        repository.findByDni(dni.trim()).ifPresent(p -> {
            String plainPassword = PasswordGenerator.generate();
            p.setPasswordHash(ENCODER.encode(plainPassword));
            repository.save(p);
            emailService.enviarCredenciales(p, plainPassword);
            log.info("Clave recuperada y enviada por email para DNI: {}", dni);
        });
        // Si el DNI no existe, no se expone — respuesta siempre 200
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
