package com.imb.habisite.service;

import com.imb.habisite.dto.CampanaInfoRequestDTO;
import com.imb.habisite.dto.CampanaResultDTO;

public interface CampanaService {

    /** Paso 2: envía info del concurso a todos los postulantes que no la recibieron aún. */
    CampanaResultDTO enviarInfoConcurso(CampanaInfoRequestDTO request);

    /** Paso 3: envía recordatorio a quienes recibieron info pero no confirmaron. */
    CampanaResultDTO enviarSegundaConvocatoria();

    /** Confirmación: el postulante clickea el link del email. */
    void confirmarParticipacion(String token);

    /** Confirmación con datos duros: el postulante completa DNI, celular y especialidad. */
    void confirmarConDatos(String token, String dni, String celular, String especialidad);

    /** Verificar si un token existe y si ya fue confirmado. */
    boolean estaConfirmado(String token);

    /** Envía email de bienvenida a todos los confirmados que aún no lo recibieron. */
    CampanaResultDTO enviarBienvenidaConfirmados();
}
