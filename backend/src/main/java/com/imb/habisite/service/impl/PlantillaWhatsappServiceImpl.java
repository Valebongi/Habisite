package com.imb.habisite.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.imb.habisite.dto.PlantillaWhatsappRequestDTO;
import com.imb.habisite.dto.PlantillaWhatsappResponseDTO;
import com.imb.habisite.exception.DuplicateResourceException;
import com.imb.habisite.exception.PlantillaWhatsappNotFoundException;
import com.imb.habisite.mapper.PlantillaWhatsappMapper;
import com.imb.habisite.model.PlantillaWhatsapp;
import com.imb.habisite.repository.PlantillaWhatsappRepository;
import com.imb.habisite.service.PlantillaWhatsappService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlantillaWhatsappServiceImpl implements PlantillaWhatsappService {

    private final PlantillaWhatsappRepository repository;
    private final PlantillaWhatsappMapper mapper;

    @Value("${meta.whatsapp.waba-id}")
    private String wabaId;

    @Value("${meta.whatsapp.token}")
    private String metaToken;

    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    @Transactional
    public PlantillaWhatsappResponseDTO crear(PlantillaWhatsappRequestDTO request) {
        log.debug("Creando plantilla WhatsApp: {}", request.getNombre());

        if (repository.existsByNombre(request.getNombre().trim())) {
            throw new DuplicateResourceException(
                    "Ya existe una plantilla con el nombre: " + request.getNombre());
        }

        PlantillaWhatsapp entity = mapper.toEntity(request);
        PlantillaWhatsapp saved = repository.save(entity);
        log.info("Plantilla WhatsApp creada con ID: {}", saved.getId());
        return mapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlantillaWhatsappResponseDTO> listarTodas() {
        log.debug("Listando todas las plantillas WhatsApp");
        return repository.findAll()
                .stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlantillaWhatsappResponseDTO> listarPorEstado(String estado) {
        log.debug("Listando plantillas WhatsApp por estado: {}", estado);
        return repository.findByEstado(estado)
                .stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PlantillaWhatsappResponseDTO buscarPorId(Long id) {
        log.debug("Buscando plantilla WhatsApp con ID: {}", id);
        return repository.findById(id)
                .map(mapper::toResponseDTO)
                .orElseThrow(() -> new PlantillaWhatsappNotFoundException(
                        "Plantilla no encontrada con ID: " + id));
    }

    @Override
    @Transactional
    public PlantillaWhatsappResponseDTO actualizar(Long id, PlantillaWhatsappRequestDTO request) {
        log.debug("Actualizando plantilla WhatsApp con ID: {}", id);

        PlantillaWhatsapp existente = repository.findById(id)
                .orElseThrow(() -> new PlantillaWhatsappNotFoundException(
                        "Plantilla no encontrada con ID: " + id));

        // Validar unicidad de nombre si cambió
        String nombreNuevo = request.getNombre().trim();
        if (!existente.getNombre().equals(nombreNuevo) && repository.existsByNombre(nombreNuevo)) {
            throw new DuplicateResourceException("Ya existe una plantilla con el nombre: " + nombreNuevo);
        }

        existente.setNombre(nombreNuevo);
        existente.setCategoria(request.getCategoria().trim());
        existente.setUso(request.getUso() != null ? request.getUso().trim() : "AMBAS");
        existente.setIdioma(request.getIdioma() != null ? request.getIdioma().trim() : "es_AR");
        existente.setHeaderTipo(request.getHeaderTipo() != null ? request.getHeaderTipo().trim() : null);
        existente.setHeaderContenido(request.getHeaderContenido() != null ? request.getHeaderContenido().trim() : null);
        existente.setBody(request.getBody().trim());
        existente.setFooter(request.getFooter() != null ? request.getFooter().trim() : null);

        PlantillaWhatsapp updated = repository.save(existente);
        log.info("Plantilla WhatsApp actualizada con ID: {}", updated.getId());
        return mapper.toResponseDTO(updated);
    }

    @Override
    @Transactional
    public PlantillaWhatsappResponseDTO enviarAMeta(Long id) {
        log.debug("Enviando plantilla WhatsApp con ID: {} a Meta", id);

        PlantillaWhatsapp plantilla = repository.findById(id)
                .orElseThrow(() -> new PlantillaWhatsappNotFoundException(
                        "Plantilla no encontrada con ID: " + id));

        // Construir componentes
        List<Map<String, Object>> components = new ArrayList<>();

        // Header TEXT (opcional)
        if ("TEXT".equalsIgnoreCase(plantilla.getHeaderTipo())
                && plantilla.getHeaderContenido() != null
                && !plantilla.getHeaderContenido().isBlank()) {
            Map<String, Object> header = new LinkedHashMap<>();
            header.put("type", "HEADER");
            header.put("format", "TEXT");
            header.put("text", plantilla.getHeaderContenido());
            components.add(header);
        }

        // Body
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("type", "BODY");
        body.put("text", plantilla.getBody());
        components.add(body);

        // Footer (opcional)
        if (plantilla.getFooter() != null && !plantilla.getFooter().isBlank()) {
            Map<String, Object> footer = new LinkedHashMap<>();
            footer.put("type", "FOOTER");
            footer.put("text", plantilla.getFooter());
            components.add(footer);
        }

        // Armar payload
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", plantilla.getNombre());
        payload.put("language", plantilla.getIdioma());
        payload.put("category", plantilla.getCategoria());
        payload.put("components", components);

        try {
            String jsonBody = OBJECT_MAPPER.writeValueAsString(payload);
            String url = "https://graph.facebook.com/v19.0/" + wabaId + "/message_templates";

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + metaToken)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(
                    httpRequest, HttpResponse.BodyHandlers.ofString());

            log.debug("Respuesta Meta API — status: {}, body: {}", response.statusCode(), response.body());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode jsonResponse = OBJECT_MAPPER.readTree(response.body());

                // Extraer id de la plantilla devuelto por Meta
                String metaTemplateId = null;
                if (jsonResponse.has("id")) {
                    metaTemplateId = jsonResponse.get("id").asText();
                }

                plantilla.setEstado("EN_REVISION");
                plantilla.setMetaTemplateId(metaTemplateId);
                PlantillaWhatsapp saved = repository.save(plantilla);
                log.info("Plantilla ID: {} enviada a Meta correctamente. Meta template ID: {}",
                        id, metaTemplateId);
                return mapper.toResponseDTO(saved);
            } else {
                String errorMsg = extraerMensajeError(response.body());
                log.error("Error al enviar plantilla ID: {} a Meta. Status: {}. Error: {}",
                        id, response.statusCode(), errorMsg);
                throw new RuntimeException("Error al enviar plantilla a Meta: " + errorMsg);
            }

        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Excepción al comunicarse con Meta API para plantilla ID: {}", id, ex);
            throw new RuntimeException("Error de comunicación con Meta API: " + ex.getMessage(), ex);
        }
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        log.debug("Eliminando plantilla WhatsApp con ID: {}", id);
        if (!repository.existsById(id)) {
            throw new PlantillaWhatsappNotFoundException("Plantilla no encontrada con ID: " + id);
        }
        repository.deleteById(id);
        log.info("Plantilla WhatsApp eliminada con ID: {}", id);
    }

    // ── helpers ─────────────────────────────────────────────────────────────────

    private String extraerMensajeError(String responseBody) {
        try {
            JsonNode json = OBJECT_MAPPER.readTree(responseBody);
            if (json.has("error")) {
                JsonNode error = json.get("error");
                if (error.has("message")) {
                    return error.get("message").asText();
                }
            }
        } catch (Exception ignored) {
            // fallback al body completo
        }
        return responseBody;
    }
}
