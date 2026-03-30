package com.imb.habisite.config;

import com.imb.habisite.model.Concurso;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.model.Rol;
import com.imb.habisite.model.Usuario;
import com.imb.habisite.repository.ConcursoRepository;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private final UsuarioRepository usuarioRepository;
    private final PostulanteRepository postulanteRepository;
    private final ConcursoRepository concursoRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedUsuario("Administrador", "admin", "habisite2025", Rol.ADMIN);
        seedUsuario("Jurado General", "jurado", "jurado2025", Rol.JURADO);
        seedPostulantePrueba();
        seedConcurso();
    }

    private void seedUsuario(String nombre, String username, String password, Rol rol) {
        if (!usuarioRepository.existsByUsername(username)) {
            Usuario nuevo = new Usuario();
            nuevo.setNombre(nombre);
            nuevo.setUsername(username);
            nuevo.setPasswordHash(ENCODER.encode(password));
            nuevo.setRol(rol);
            usuarioRepository.save(nuevo);
            log.info("Usuario '{}' ({}) creado en DB.", username, rol);
        }
    }

    private void seedPostulantePrueba() {
        String testDni = "12345678";
        String testPassword = "Test2026!";

        var opt = postulanteRepository.findByDni(testDni);
        if (opt.isPresent()) {
            Postulante p = opt.get();
            if (p.getPasswordHash() == null) {
                p.setPasswordHash(ENCODER.encode(testPassword));
                postulanteRepository.save(p);
                log.info("Postulante prueba DNI {} — clave seteada.", testDni);
            }
        } else {
            Postulante p = Postulante.builder()
                    .nombres("Postulante")
                    .apellidos("Demo")
                    .dni(testDni)
                    .celular("+5491100000000")
                    .universidad("Universidad de Prueba")
                    .correoElectronico("demo@habisite.com")
                    .especialidad("Arquitectura")
                    .passwordHash(ENCODER.encode(testPassword))
                    .build();
            postulanteRepository.save(p);
            log.info("Postulante prueba DNI {} creado con clave: {}", testDni, testPassword);
        }
    }

    private void seedConcurso() {
        if (!concursoRepository.existsByTitulo("Habisite Design Challenge 2026")) {
            Concurso c = new Concurso();
            c.setTitulo("Habisite Design Challenge 2026");
            c.setDescripcion(
                "El Habisite Design Challenge 2026 convoca a estudiantes y profesionales de " +
                "arquitectura, diseño de interiores, paisajismo y disciplinas afines a presentar " +
                "propuestas innovadoras que respondan al desafío del hábitat contemporáneo. " +
                "Las mejores propuestas serán expuestas y premiadas en la gala de cierre."
            );
            c.setBases(
                "1. Pueden participar estudiantes y egresados de carreras de diseño y arquitectura.\n" +
                "2. Cada participante puede presentar una sola propuesta por edición.\n" +
                "3. La entrega debe incluir: memoria descriptiva (PDF), láminas A3 (PDF) y renders (JPG/PNG).\n" +
                "4. El archivo no debe superar los 20 MB.\n" +
                "5. El jurado evaluará: innovación, viabilidad técnica, impacto ambiental y presentación.\n" +
                "6. Los resultados se anunciarán en la gala de cierre del evento."
            );
            c.setFechaInicio(OffsetDateTime.now());
            c.setFechaFin(OffsetDateTime.now().plusMonths(3));
            c.setEstado("ACTIVO");
            concursoRepository.save(c);
            log.info("Concurso de prueba '{}' creado en DB.", c.getTitulo());
        }
    }
}
