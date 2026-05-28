package com.imb.habisite.repository;

import com.imb.habisite.model.PlantillaWhatsapp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantillaWhatsappRepository extends JpaRepository<PlantillaWhatsapp, Long> {

    List<PlantillaWhatsapp> findByEstado(String estado);

    boolean existsByNombre(String nombre);
}
