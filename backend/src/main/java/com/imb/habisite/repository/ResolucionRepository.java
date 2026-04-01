package com.imb.habisite.repository;

import com.imb.habisite.model.Resolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResolucionRepository extends JpaRepository<Resolucion, Long> {
    List<Resolucion> findByPostulanteIdOrderByCreadoEnDesc(Long postulanteId);
    List<Resolucion> findAllByOrderByCreadoEnDesc();
    long countByEstado(String estado);

    @Query("SELECT r.estado, COUNT(r) FROM Resolucion r GROUP BY r.estado")
    List<Object[]> countByEstadoGrouped();

    List<Resolucion> findByConcursoId(Long concursoId);
    long countByConcursoIdAndEstado(Long concursoId, String estado);
}
