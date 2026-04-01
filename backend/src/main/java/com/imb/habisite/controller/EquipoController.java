package com.imb.habisite.controller;

import com.imb.habisite.model.Equipo;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.repository.EquipoRepository;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.service.EmailService;
import com.imb.habisite.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/v1/equipo")
@RequiredArgsConstructor
public class EquipoController {

    private final EquipoRepository equipoRepo;
    private final PostulanteRepository postulanteRepo;
    private final EmailService emailService;
    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    /** Lista los miembros del equipo de un postulante */
    @GetMapping("/{postulanteId}")
    public List<Map<String, Object>> listar(@PathVariable Long postulanteId) {
        return equipoRepo.findByPostulanteId(postulanteId).stream().map(this::toMap).toList();
    }

    /** Busca un postulante por DNI para auto-fill */
    @GetMapping("/buscar-dni")
    public ResponseEntity<Map<String, Object>> buscarDni(@RequestParam String dni) {
        return postulanteRepo.findByDni(dni.trim())
                .map(p -> ResponseEntity.ok(Map.<String, Object>of(
                        "encontrado", true,
                        "id", p.getId(),
                        "nombres", p.getNombres(),
                        "apellidos", p.getApellidos(),
                        "dni", p.getDni(),
                        "email", p.getCorreoElectronico(),
                        "celular", p.getCelular() != null ? p.getCelular() : ""
                )))
                .orElse(ResponseEntity.ok(Map.of("encontrado", false)));
    }

    /** Agrega un miembro al equipo. Si no existe como postulante, lo crea y envía credenciales. */
    @PostMapping("/{postulanteId}")
    public ResponseEntity<Map<String, Object>> agregar(
            @PathVariable Long postulanteId, @RequestBody Map<String, String> body) {

        String dni = body.getOrDefault("dni", "").trim();
        String email = body.getOrDefault("email", "").trim();
        String nombres = body.getOrDefault("nombres", "").trim();
        String apellidos = body.getOrDefault("apellidos", "").trim();
        String celular = body.getOrDefault("celular", "").trim();

        if (dni.isEmpty() || email.isEmpty() || nombres.isEmpty() || apellidos.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Faltan datos obligatorios."));
        }

        Postulante owner = postulanteRepo.findById(postulanteId).orElse(null);
        if (owner == null) return ResponseEntity.badRequest().body(Map.of("error", "Postulante no encontrado."));

        // Verificar si ya está en el equipo
        if (equipoRepo.findByPostulanteIdAndDni(postulanteId, dni).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Este miembro ya está en tu equipo."));
        }

        // Buscar si el DNI ya existe como postulante
        Postulante miembro = postulanteRepo.findByDni(dni).orElse(null);
        String passwordGenerada = null;

        if (miembro == null) {
            // Crear nuevo postulante
            passwordGenerada = PasswordGenerator.generate();
            miembro = Postulante.builder()
                    .nombres(nombres).apellidos(apellidos).dni(dni)
                    .correoElectronico(email.toLowerCase())
                    .celular(celular.isEmpty() ? null : celular)
                    .universidad(owner.getUniversidad())
                    .especialidad(owner.getEspecialidad())
                    .passwordHash(ENCODER.encode(passwordGenerada))
                    .build();
            postulanteRepo.save(miembro);
            log.info("Nuevo postulante creado desde equipo: DNI {}", dni);
        }

        Equipo eq = Equipo.builder()
                .postulante(owner).miembro(miembro)
                .dni(dni).email(email).celular(celular)
                .nombres(nombres).apellidos(apellidos)
                .build();
        equipoRepo.save(eq);

        // Enviar credenciales al nuevo miembro
        if (passwordGenerada != null) {
            try {
                emailService.enviarCredenciales(miembro, passwordGenerada);
            } catch (Exception e) {
                log.warn("No se pudo enviar email a {}: {}", email, e.getMessage());
            }
        }

        return ResponseEntity.ok(toMap(eq));
    }

    @DeleteMapping("/{equipoId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long equipoId) {
        if (!equipoRepo.existsById(equipoId)) return ResponseEntity.notFound().build();
        equipoRepo.deleteById(equipoId);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(Equipo e) {
        return Map.of(
                "id", e.getId(),
                "postulanteId", e.getPostulante().getId(),
                "miembroId", e.getMiembro() != null ? e.getMiembro().getId() : 0,
                "dni", e.getDni(),
                "email", e.getEmail(),
                "celular", e.getCelular() != null ? e.getCelular() : "",
                "nombres", e.getNombres(),
                "apellidos", e.getApellidos()
        );
    }
}
