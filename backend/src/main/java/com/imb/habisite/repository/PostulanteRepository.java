package com.imb.habisite.repository;

import com.imb.habisite.model.Postulante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostulanteRepository extends JpaRepository<Postulante, Long> {

    boolean existsByDni(String dni);

    boolean existsByCorreoElectronico(String correoElectronico);

    Optional<Postulante> findByDni(String dni);

    // ── Campañas ─────────────────────────────────────────────────────────────
    List<Postulante> findByInfoEnviadaEnIsNull();

    List<Postulante> findByInfoEnviadaEnIsNotNullAndConfirmadoEnIsNull();

    Optional<Postulante> findByTokenConfirmacion(String tokenConfirmacion);

    long countByInfoEnviadaEnIsNotNull();

    long countByConfirmadoEnIsNotNull();

    long countByInfoEnviadaEnIsNotNullAndConfirmadoEnIsNull();

    long countByRecordatorioEnviadoEnIsNotNull();

    // Confirmados que aún no recibieron mail de bienvenida
    List<Postulante> findByConfirmadoEnIsNotNullAndBienvenidaEnviadaEnIsNull();

    // Todos los confirmados
    List<Postulante> findByConfirmadoEnIsNotNull();

    long countByBienvenidaEnviadaEnIsNotNull();
}
