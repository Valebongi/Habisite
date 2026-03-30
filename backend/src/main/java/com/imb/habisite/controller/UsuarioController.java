package com.imb.habisite.controller;

import com.imb.habisite.model.Rol;
import com.imb.habisite.model.Usuario;
import com.imb.habisite.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    /** GET /api/v1/admin/usuarios — lista todos los usuarios (sin exponer password) */
    @GetMapping
    public List<Map<String, Object>> listar() {
        return usuarioRepository.findAll().stream().map(this::sinPassword).toList();
    }

    /** POST /api/v1/admin/usuarios — crea un nuevo usuario admin o jurado */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, String> body) {
        String nombre   = body.get("nombre");
        String username = body.get("username");
        String password = body.get("password");
        String rolStr   = body.get("rol");

        if (nombre == null || username == null || password == null || rolStr == null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Faltan campos obligatorios."));
        }
        if (usuarioRepository.existsByUsername(username)) {
            return ResponseEntity.status(409).body(Map.of("mensaje", "El username ya existe."));
        }

        Rol rol;
        try { rol = Rol.valueOf(rolStr.toUpperCase()); }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Rol invalido. Usar ADMIN o JURADO."));
        }

        Usuario u = Usuario.builder()
                .nombre(nombre.trim())
                .username(username.trim().toLowerCase())
                .passwordHash(ENCODER.encode(password))
                .rol(rol)
                .build();
        usuarioRepository.save(u);
        return ResponseEntity.ok(sinPassword(u));
    }

    /** PUT /api/v1/admin/usuarios/{id} — actualiza nombre, username, rol y opcionalmente password */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return usuarioRepository.findById(id).map(u -> {
            if (body.containsKey("nombre"))   u.setNombre(body.get("nombre").trim());
            if (body.containsKey("username")) {
                String newUsername = body.get("username").trim().toLowerCase();
                if (!newUsername.equals(u.getUsername()) && usuarioRepository.existsByUsername(newUsername)) {
                    return ResponseEntity.status(409).body((Object) Map.of("mensaje", "El username ya existe."));
                }
                u.setUsername(newUsername);
            }
            if (body.containsKey("rol")) {
                try { u.setRol(Rol.valueOf(body.get("rol").toUpperCase())); }
                catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body((Object) Map.of("mensaje", "Rol invalido."));
                }
            }
            if (body.containsKey("password") && !body.get("password").isBlank()) {
                u.setPasswordHash(ENCODER.encode(body.get("password")));
            }
            usuarioRepository.save(u);
            return ResponseEntity.ok((Object) sinPassword(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/v1/admin/usuarios/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) return ResponseEntity.notFound().build();
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> sinPassword(Usuario u) {
        return Map.of(
                "id", u.getId(),
                "nombre", u.getNombre(),
                "username", u.getUsername(),
                "rol", u.getRol().name(),
                "creadoEn", u.getCreadoEn().toString()
        );
    }
}
