package com.imb.habisite.repository;

import com.imb.habisite.model.CriterioEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CriterioEvaluacionRepository extends JpaRepository<CriterioEvaluacion, Long> {
    List<CriterioEvaluacion> findByConcursoIdOrderByOrdenAsc(Long concursoId);
}
