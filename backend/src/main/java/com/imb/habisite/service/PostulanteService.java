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

    void eliminar(Long id);
}
