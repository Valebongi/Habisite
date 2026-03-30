package com.imb.habisite.repository;

import com.imb.habisite.model.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecursoRepository extends JpaRepository<Recurso, Long> {
    List<Recurso> findAllByOrderByCreadoEnDesc();
    List<Recurso> findByTipoOrderByCreadoEnDesc(String tipo);
}
