package com.imb.habisite.controller;

import com.imb.habisite.dto.ResolucionResponseDTO;
import com.imb.habisite.model.Concurso;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.model.Resolucion;
import com.imb.habisite.repository.ConcursoRepository;
import com.imb.habisite.repository.PostulanteRepository;
import com.imb.habisite.repository.ResolucionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/v1/resoluciones")
@RequiredArgsConstructor
public class ResolucionController {

    private final ResolucionRepository resolucionRepo;
    private final PostulanteRepository postulanteRepo;
    private final ConcursoRepository concursoRepo;

    /** Sube una resolución (archivo opcional + URL opcional) */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResolucionResponseDTO> subir(
            @RequestParam long postulanteId,
            @RequestParam long concursoId,
            @RequestParam String titulo,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) String urlExterno,
            @RequestParam(required = false) MultipartFile archivo) throws IOException {

        Postulante postulante = postulanteRepo.findById(postulanteId)
                .orElseThrow(() -> new IllegalArgumentException("Postulante no encontrado"));
        Concurso concurso = concursoRepo.findById(concursoId)
                .orElseThrow(() -> new IllegalArgumentException("Concurso no encontrado"));

        Resolucion r = new Resolucion();
        r.setPostulante(postulante);
        r.setConcurso(concurso);
        r.setTitulo(titulo.trim());
        r.setDescripcion(descripcion != null ? descripcion.trim() : null);
        r.setUrlExterno(urlExterno != null && !urlExterno.isBlank() ? urlExterno.trim() : null);

        if (archivo != null && !archivo.isEmpty()) {
            r.setArchivoNombre(archivo.getOriginalFilename());
            r.setArchivoDatos(archivo.getBytes());
        }

        return ResponseEntity.ok(toDTO(resolucionRepo.save(r)));
    }

    /** Lista las resoluciones de un postulante */
    @GetMapping("/postulante/{postulanteId}")
    public List<ResolucionResponseDTO> listarPorPostulante(@PathVariable long postulanteId) {
        return resolucionRepo.findByPostulanteIdOrderByCreadoEnDesc(postulanteId)
                .stream().map(this::toDTO).toList();
    }

    /** Lista todas las resoluciones (admin) */
    @GetMapping
    public List<ResolucionResponseDTO> listarTodas() {
        return resolucionRepo.findAllByOrderByCreadoEnDesc()
                .stream().map(this::toDTO).toList();
    }

    /** Cambia el estado de una resolución (admin: APROBADA / RECHAZADA) */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ResolucionResponseDTO> cambiarEstado(
            @PathVariable long id, @RequestParam String estado) {
        return resolucionRepo.findById(id).map(r -> {
            r.setEstado(estado);
            return ResponseEntity.ok(toDTO(resolucionRepo.save(r)));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Descarga el archivo de una resolución */
    @GetMapping("/{id}/archivo")
    public ResponseEntity<byte[]> descargarArchivo(@PathVariable long id) {
        return resolucionRepo.findById(id).map(r -> {
            if (r.getArchivoDatos() == null) return ResponseEntity.notFound().<byte[]>build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + r.getArchivoNombre() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .body(r.getArchivoDatos());
        }).orElse(ResponseEntity.notFound().build());
    }

    private ResolucionResponseDTO toDTO(Resolucion r) {
        ResolucionResponseDTO dto = new ResolucionResponseDTO();
        dto.setId(r.getId());
        dto.setPostulanteId(r.getPostulante().getId());
        dto.setPostulanteNombre(r.getPostulante().getNombres() + " " + r.getPostulante().getApellidos());
        dto.setConcursoId(r.getConcurso().getId());
        dto.setConcursoTitulo(r.getConcurso().getTitulo());
        dto.setTitulo(r.getTitulo());
        dto.setDescripcion(r.getDescripcion());
        dto.setArchivoNombre(r.getArchivoNombre());
        dto.setTieneArchivo(r.getArchivoDatos() != null);
        dto.setUrlExterno(r.getUrlExterno());
        dto.setEstado(r.getEstado());
        dto.setCreadoEn(r.getCreadoEn());
        return dto;
    }
}
