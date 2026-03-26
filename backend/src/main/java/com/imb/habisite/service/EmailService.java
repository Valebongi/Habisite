package com.imb.habisite.service;

import com.imb.habisite.model.Postulante;

public interface EmailService {
    void enviarConfirmacionPostulacion(Postulante postulante);
}
