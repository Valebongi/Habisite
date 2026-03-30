package com.imb.habisite.controller;

import com.imb.habisite.model.Publicacion;
import com.imb.habisite.repository.PublicacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin/publicaciones")
@RequiredArgsConstructor
public class PublicacionController {

    private final PublicacionRepository repo;

    @GetMapping
    public List<Publicacion> listar() {
        return repo.findAllByOrderByCreadoEnDesc();
    }

    @PostMapping
    public Publicacion crear(@RequestBody Map<String, Object> body) {
        Publicacion p = Publicacion.builder()
                .titulo((String) body.get("titulo"))
                .contenido((String) body.get("contenido"))
                .autor(body.getOrDefault("autor", "Admin").toString())
                .publicado(Boolean.TRUE.equals(body.get("publicado")))
                .build();
        return repo.save(p);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Publicacion> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return repo.findById(id).map(p -> {
            if (body.containsKey("titulo"))    p.setTitulo((String) body.get("titulo"));
            if (body.containsKey("contenido")) p.setContenido((String) body.get("contenido"));
            if (body.containsKey("autor"))     p.setAutor((String) body.get("autor"));
            if (body.containsKey("publicado")) p.setPublicado(Boolean.TRUE.equals(body.get("publicado")));
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
