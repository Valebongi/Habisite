package com.imb.habisite.config;

import com.imb.habisite.model.*;
import com.imb.habisite.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
    private final ResolucionRepository resolucionRepository;
    private final CriterioEvaluacionRepository criterioRepository;

    @Value("${app.seed.admin-pass:#{null}}")
    private String adminPass;

    @Value("${app.seed.jurado-pass:#{null}}")
    private String juradoPass;

    @Override
    public void run(ApplicationArguments args) {
        String ap = adminPass != null ? adminPass : System.getenv().getOrDefault("ADMIN_SEED_PASS", "habisite2025");
        String jp = juradoPass != null ? juradoPass : System.getenv().getOrDefault("JURADO_SEED_PASS", "jurado2025");
        seedUsuario("Administrador", "admin", ap, Rol.ADMIN);
        seedUsuario("Jurado General", "jurado", jp, Rol.JURADO);
        seedPostulantePrueba();
        seedConcurso();
        seedCriteriosYPropuestas();
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

    private void seedCriteriosYPropuestas() {
        var concursos = concursoRepository.findByEstadoOrderByFechaFinAsc("ACTIVO");
        if (concursos.isEmpty()) return;
        Concurso c = concursos.get(0);

        // Criterios de evaluación (si no existen)
        if (criterioRepository.findByConcursoIdOrderByOrdenAsc(c.getId()).isEmpty()) {
            String[][] criterios = {
                    {"Innovación", "3"},
                    {"Viabilidad técnica", "2"},
                    {"Impacto ambiental", "2"},
                    {"Presentación visual", "2"},
                    {"Funcionalidad del espacio", "1"},
            };
            for (int i = 0; i < criterios.length; i++) {
                criterioRepository.save(CriterioEvaluacion.builder()
                        .concurso(c)
                        .nombre(criterios[i][0])
                        .peso(Integer.parseInt(criterios[i][1]))
                        .orden(i + 1)
                        .build());
            }
            log.info("5 criterios de evaluación creados para '{}'.", c.getTitulo());
        }

        // 5 propuestas mock (si no hay resoluciones)
        if (resolucionRepository.findByConcursoId(c.getId()).isEmpty()) {
            var postulante = postulanteRepository.findByDni("12345678").orElse(null);
            if (postulante == null) return;

            String[][] props = {
                    {"Centro Comunitario Solar", "Espacio multifuncional con paneles fotovoltaicos integrados en cubierta."},
                    {"Biblioteca Flotante", "Estructura modular sobre espejo de agua con ventilación natural cruzada."},
                    {"Hub de Reciclaje Urbano", "Punto de acopio y taller de reutilización para barrios periféricos."},
                    {"Refugio Bioclimático", "Vivienda de emergencia con materiales locales y confort térmico pasivo."},
                    {"Parque Vertical", "Fachada verde transitable en edificio existente del microcentro."},
            };
            for (String[] p : props) {
                Resolucion r = new Resolucion();
                r.setPostulante(postulante);
                r.setConcurso(c);
                r.setTitulo(p[0]);
                r.setDescripcion(p[1]);
                r.setEstado("PENDIENTE");
                r.setPropuesta(p[0]);
                r.setTipoEntrega("INDIVIDUAL");
                resolucionRepository.save(r);
            }
            log.info("5 propuestas mock creadas para '{}'.", c.getTitulo());
        }
    }
}
