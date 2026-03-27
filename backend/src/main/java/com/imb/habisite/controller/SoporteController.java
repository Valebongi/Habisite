package com.imb.habisite.controller;

import com.imb.habisite.dto.SoporteTicketRequestDTO;
import com.imb.habisite.dto.SoporteTicketResponseDTO;
import com.imb.habisite.model.SoporteTicket;
import com.imb.habisite.repository.SoporteTicketRepository;
import com.imb.habisite.service.EmailService;
import com.imb.habisite.service.PostulanteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/v1/soporte")
@RequiredArgsConstructor
public class SoporteController {

    private final SoporteTicketRepository ticketRepo;
    private final EmailService emailService;
    private final PostulanteService postulanteService;

    /** Crea un ticket de soporte desde la pantalla de login */
    @PostMapping("/ticket")
    public ResponseEntity<SoporteTicketResponseDTO> crearTicket(
            @Valid @RequestBody SoporteTicketRequestDTO dto) {

        SoporteTicket ticket = new SoporteTicket();
        ticket.setNombre(dto.getNombre().trim());
        ticket.setDni(dto.getDni() != null ? dto.getDni().trim() : null);
        ticket.setMensaje(dto.getMensaje().trim());

        SoporteTicket guardado = ticketRepo.save(ticket);
        emailService.notificarTicketSoporte(guardado);

        // Si viene DNI, regenerar y enviar credenciales automáticamente
        if (dto.getDni() != null && !dto.getDni().isBlank()) {
            try {
                var postulante = postulanteService.buscarPorDni(dto.getDni().trim());
                postulanteService.regenerarClave(postulante.getId());
                log.info("Credenciales regeneradas automáticamente para DNI {}", dto.getDni());
            } catch (Exception e) {
                log.warn("No se encontró postulante con DNI {} al procesar ticket de soporte", dto.getDni());
            }
        }

        return ResponseEntity.ok(toDTO(guardado));
    }

    /** Lista todos los tickets (para el panel admin) */
    @GetMapping("/tickets")
    public List<SoporteTicketResponseDTO> listarTickets() {
        return ticketRepo.findAllByOrderByCreadoEnDesc()
                .stream().map(this::toDTO).toList();
    }

    /** Marca un ticket como resuelto */
    @PatchMapping("/tickets/{id}/resolver")
    public ResponseEntity<SoporteTicketResponseDTO> resolver(@PathVariable long id) {
        return ticketRepo.findById(id).map(t -> {
            t.setResuelto(true);
            return ResponseEntity.ok(toDTO(ticketRepo.save(t)));
        }).orElse(ResponseEntity.notFound().build());
    }

    private SoporteTicketResponseDTO toDTO(SoporteTicket t) {
        SoporteTicketResponseDTO dto = new SoporteTicketResponseDTO();
        dto.setId(t.getId());
        dto.setNombre(t.getNombre());
        dto.setDni(t.getDni());
        dto.setMensaje(t.getMensaje());
        dto.setResuelto(t.isResuelto());
        dto.setCreadoEn(t.getCreadoEn());
        return dto;
    }
}
