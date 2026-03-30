package com.imb.habisite.service;

import com.imb.habisite.model.Concurso;
import com.imb.habisite.model.Postulante;
import com.imb.habisite.model.SoporteTicket;

public interface EmailService {
    /** Envía usuario (DNI) y contraseña generada al correo del postulante. */
    void enviarCredenciales(Postulante postulante, String plainPassword);
    void notificarTicketSoporte(SoporteTicket ticket);

    /** Paso 2a: Envía info detallada del concurso + link de confirmación. */
    void enviarInfoConcurso(Postulante postulante, Concurso concurso, String confirmacionUrl);

    /** Paso 2b: Envía email de confirmación exitosa con datos de webinar y canal. */
    void enviarConfirmacionExitosa(Postulante postulante, Concurso concurso);

    /** Paso 3: Envía recordatorio de última oportunidad a quienes no confirmaron. */
    void enviarSegundaConvocatoria(Postulante postulante, Concurso concurso, String confirmacionUrl);
}
