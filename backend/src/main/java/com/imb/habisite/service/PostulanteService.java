package com.imb.habisite.service;

import com.imb.habisite.dto.PostulanteRequestDTO;
import com.imb.habisite.dto.PostulanteResponseDTO;

import java.util.List;

public interface PostulanteService {

    PostulanteResponseDTO registrar(PostulanteRequestDTO request);

    List<PostulanteResponseDTO> listarTodos();

    PostulanteResponseDTO buscarPorId(Long id);

    PostulanteResponseDTO buscarPorDni(String dni);

    PostulanteResponseDTO actualizar(Long id, PostulanteRequestDTO request);

    /** Genera una nueva contraseña y la envía por email al postulante. */
    void regenerarClave(Long id);

    /** Recupera la clave buscando por DNI — no expone si el DNI existe. */
    void recuperarClavePorDni(String dni);

    void eliminar(Long id);
}
