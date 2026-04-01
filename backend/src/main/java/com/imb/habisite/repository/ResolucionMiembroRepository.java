package com.imb.habisite.repository;

import com.imb.habisite.model.ResolucionMiembro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResolucionMiembroRepository extends JpaRepository<ResolucionMiembro, Long> {
    List<ResolucionMiembro> findByResolucionId(Long resolucionId);
    List<ResolucionMiembro> findByPostulanteId(Long postulanteId);
}
