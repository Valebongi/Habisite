package com.imb.habisite.service;

import com.imb.habisite.model.Postulante;
import com.imb.habisite.model.SoporteTicket;

public interface EmailService {
    /** Envía usuario (DNI) y contraseña generada al correo del postulante. */
    void enviarCredenciales(Postulante postulante, String plainPassword);
    void notificarTicketSoporte(SoporteTicket ticket);
}
