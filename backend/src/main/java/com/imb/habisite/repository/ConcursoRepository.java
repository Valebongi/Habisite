package com.imb.habisite.repository;

import com.imb.habisite.model.Concurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConcursoRepository extends JpaRepository<Concurso, Long> {
    List<Concurso> findAllByOrderByFechaFinAsc();
    List<Concurso> findByEstadoOrderByFechaFinAsc(String estado);
    boolean existsByTitulo(String titulo);
}
