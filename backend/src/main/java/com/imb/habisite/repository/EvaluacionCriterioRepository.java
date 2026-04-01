package com.imb.habisite.repository;

import com.imb.habisite.model.EvaluacionCriterio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EvaluacionCriterioRepository extends JpaRepository<EvaluacionCriterio, Long> {
    List<EvaluacionCriterio> findByEvaluacionId(Long evaluacionId);
}
