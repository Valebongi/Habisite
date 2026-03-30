package com.imb.habisite.controller;

import com.imb.habisite.model.Recurso;
import com.imb.habisite.repository.RecursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin/recursos")
@RequiredArgsConstructor
public class RecursoController {

    private final RecursoRepository repo;

    @GetMapping
    public List<Map<String, Object>> listar() {
        return repo.findAllByOrderByCreadoEnDesc().stream().map(this::sinDatos).toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> subir(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(value = "nombre", required = false) String nombre,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "tipo", defaultValue = "imagen") String tipo
    ) throws IOException {
        Recurso r = Recurso.builder()
                .nombre(nombre != null && !nombre.isBlank() ? nombre.trim() : archivo.getOriginalFilename())
                .descripcion(descripcion != null ? descripcion.trim() : null)
                .tipo(tipo.trim())
                .archivoNombre(archivo.getOriginalFilename())
                .archivoDatos(archivo.getBytes())
                .contentType(archivo.getContentType())
                .tamanio(archivo.getSize())
                .build();
        return sinDatos(repo.save(r));
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<byte[]> descargar(@PathVariable Long id) {
        return repo.findById(id).map(r -> {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    r.getContentType() != null ? r.getContentType() : "application/octet-stream"));
            headers.setContentDisposition(ContentDisposition.inline().filename(r.getArchivoNombre()).build());
            return new ResponseEntity<>(r.getArchivoDatos(), headers, HttpStatus.OK);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> sinDatos(Recurso r) {
        return Map.of(
                "id", r.getId(),
                "nombre", r.getNombre(),
                "descripcion", r.getDescripcion() != null ? r.getDescripcion() : "",
                "tipo", r.getTipo(),
                "archivoNombre", r.getArchivoNombre(),
                "contentType", r.getContentType() != null ? r.getContentType() : "",
                "tamanio", r.getTamanio() != null ? r.getTamanio() : 0,
                "creadoEn", r.getCreadoEn().toString()
        );
    }
}
