package com.imb.habisite.service.impl;

import com.imb.habisite.dto.LoginRequestDTO;
import com.imb.habisite.dto.LoginResponseDTO;
import com.imb.habisite.exception.PostulanteNotFoundException;
import com.imb.habisite.mapper.PostulanteMapper;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.model.Usuario;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.repository.UsuarioRepository;
import com.imb.habisite.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private final UsuarioRepository usuarioRepository;
    private final PostulanteRepository postulanteRepository;
    private final PostulanteMapper postulanteMapper;

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        String identifier = request.getUsername().trim();

        // 1. Buscar en tabla usuario (ADMIN / JURADO)
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(identifier);
        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();
            if (request.getPassword() == null || !ENCODER.matches(request.getPassword(), u.getPasswordHash())) {
                throw new IllegalArgumentException("Contraseña incorrecta.");
            }
            return LoginResponseDTO.builder()
                    .rol(u.getRol().name())
                    .nombre(u.getNombre())
                    .build();
        }

        // 2. Buscar en tabla postulante por DNI con verificación de contraseña
        Optional<Postulante> postulanteOpt = postulanteRepository.findByDni(identifier);
        if (postulanteOpt.isPresent()) {
            Postulante p = postulanteOpt.get();
            if (p.getPasswordHash() == null) {
                throw new IllegalArgumentException("Tu acceso aún no fue configurado. Contactá a la organización.");
            }
            if (request.getPassword() == null || !ENCODER.matches(request.getPassword(), p.getPasswordHash())) {
                throw new IllegalArgumentException("Contraseña incorrecta.");
            }
            return LoginResponseDTO.builder()
                    .rol("POSTULANTE")
                    .nombre(p.getNombres() + " " + p.getApellidos())
                    .postulante(postulanteMapper.toResponseDTO(p))
                    .build();
        }

        throw new PostulanteNotFoundException("Usuario no encontrado. Verificá tu usuario o DNI.");
    }
}
