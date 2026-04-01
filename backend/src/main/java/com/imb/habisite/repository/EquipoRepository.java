package com.imb.habisite.repository;

import com.imb.habisite.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {
    List<Equipo> findByPostulanteId(Long postulanteId);
    Optional<Equipo> findByPostulanteIdAndDni(Long postulanteId, String dni);
    List<Equipo> findByMiembroId(Long miembroId);
}
