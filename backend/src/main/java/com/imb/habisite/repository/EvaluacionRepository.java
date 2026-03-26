package com.imb.habisite.repository;

import com.imb.habisite.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {

    List<Evaluacion> findByPostulanteId(Long postulanteId);

    boolean existsByPostulanteIdAndJuradoNombre(Long postulanteId, String juradoNombre);
}
