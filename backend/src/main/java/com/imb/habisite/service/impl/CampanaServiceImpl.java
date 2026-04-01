package com.imb.habisite.service.impl;

import com.imb.habisite.dto.CampanaInfoRequestDTO;
import com.imb.habisite.dto.CampanaResultDTO;
import com.imb.habisite.model.Concurso;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.repository.ConcursoRepository;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.service.CampanaService;
import com.imb.habisite.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampanaServiceImpl implements CampanaService {

    private final PostulanteRepository postulanteRepository;
    private final ConcursoRepository concursoRepository;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public CampanaResultDTO enviarInfoConcurso(CampanaInfoRequestDTO request) {
        Concurso concurso = obtenerConcursoActivo();

        // Guardar datos de webinar/canal en el concurso activo
        concurso.setWebinarUrl(request.getWebinarUrl());
        concurso.setWebinarFecha(request.getWebinarFecha());
        concurso.setCanalUrl(request.getCanalUrl());
        concurso.setCanalNombre(request.getCanalNombre());
        concursoRepository.save(concurso);

        List<Postulante> pendientes = postulanteRepository.findByInfoEnviadaEnIsNull();
        int enviados = 0;

        for (Postulante p : pendientes) {
            String token = UUID.randomUUID().toString();
            p.setTokenConfirmacion(token);
            p.setInfoEnviadaEn(OffsetDateTime.now());
            postulanteRepository.save(p);

            String confirmacionUrl = frontendUrl + "/confirmar?token=" + token;
            emailService.enviarInfoConcurso(p, concurso, confirmacionUrl);
            enviados++;
        }

        long total = postulanteRepository.count();
        int omitidos = (int) (total - enviados);

        log.info("Campaña info concurso: {} emails enviados, {} omitidos (ya enviados)", enviados, omitidos);

        return CampanaResultDTO.builder()
                .emailsEnviados(enviados)
                .emailsOmitidos(omitidos)
                .mensaje("Se enviaron " + enviados + " emails con la informacion del concurso.")
                .build();
    }

    @Override
    @Transactional
    public CampanaResultDTO enviarSegundaConvocatoria() {
        Concurso concurso = obtenerConcursoActivo();

        List<Postulante> noConfirmados = postulanteRepository
                .findByInfoEnviadaEnIsNotNullAndConfirmadoEnIsNull();

        int enviados = 0;
        for (Postulante p : noConfirmados) {
            p.setRecordatorioEnviadoEn(OffsetDateTime.now());
            postulanteRepository.save(p);

            String confirmacionUrl = frontendUrl + "/confirmar?token=" + p.getTokenConfirmacion();
            emailService.enviarSegundaConvocatoria(p, concurso, confirmacionUrl);
            enviados++;
        }

        log.info("2da convocatoria: {} recordatorios enviados", enviados);

        return CampanaResultDTO.builder()
                .emailsEnviados(enviados)
                .emailsOmitidos(0)
                .mensaje("Se enviaron " + enviados + " recordatorios de ultima oportunidad.")
                .build();
    }

    @Override
    @Transactional
    public void confirmarParticipacion(String token) {
        Postulante postulante = postulanteRepository.findByTokenConfirmacion(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de confirmacion invalido o expirado."));

        if (postulante.getConfirmadoEn() != null) {
            log.info("Postulante {} ya estaba confirmado.", postulante.getDni());
            return; // idempotente
        }

        postulante.setConfirmadoEn(OffsetDateTime.now());
        postulanteRepository.save(postulante);

        Concurso concurso = obtenerConcursoActivo();
        emailService.enviarConfirmacionExitosa(postulante, concurso);

        log.info("Postulante {} confirmo su participacion.", postulante.getDni());
    }

    @Override
    @Transactional
    public void confirmarConDatos(String token, String dni, String celular, String especialidad) {
        Postulante postulante = postulanteRepository.findByTokenConfirmacion(token)
                .orElseThrow(() -> new IllegalArgumentException("Token de confirmacion invalido o expirado."));

        if (postulante.getConfirmadoEn() != null) {
            log.info("Postulante {} ya estaba confirmado.", postulante.getDni());
            return;
        }

        // Validar que el DNI no esté tomado por otro postulante
        String dniLimpio = dni.trim();
        postulanteRepository.findByDni(dniLimpio).ifPresent(otro -> {
            if (!otro.getId().equals(postulante.getId())) {
                throw new IllegalArgumentException("Ya existe otro postulante con el DNI: " + dniLimpio);
            }
        });

        // Actualizar datos duros
        postulante.setDni(dniLimpio);
        postulante.setCelular(celular.trim());
        postulante.setEspecialidad(especialidad.trim());
        postulante.setConfirmadoEn(OffsetDateTime.now());

        // Generar credenciales con el DNI como usuario
        String plainPassword = com.imb.habisite.util.PasswordGenerator.generate();
        postulante.setPasswordHash(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(plainPassword));

        postulanteRepository.save(postulante);
        log.info("Postulante {} confirmo con datos duros (DNI: {}).", postulante.getNombres(), dniLimpio);

        // Emails asíncronos — no bloquean la confirmación
        try {
            emailService.enviarCredenciales(postulante, plainPassword);
            List<Concurso> activos = concursoRepository.findByEstadoOrderByFechaFinAsc("ACTIVO");
            if (!activos.isEmpty()) {
                emailService.enviarConfirmacionExitosa(postulante, activos.get(0));
            }
        } catch (Exception e) {
            log.warn("No se pudo enviar email post-confirmacion para {}: {}", dniLimpio, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean estaConfirmado(String token) {
        Postulante postulante = postulanteRepository.findByTokenConfirmacion(token)
                .orElseThrow(() -> new IllegalArgumentException("Token invalido."));
        return postulante.getConfirmadoEn() != null;
    }

    private Concurso obtenerConcursoActivo() {
        List<Concurso> activos = concursoRepository.findByEstadoOrderByFechaFinAsc("ACTIVO");
        if (activos.isEmpty()) {
            throw new IllegalStateException("No hay ningun concurso activo configurado.");
        }
        return activos.get(0);
    }
}
