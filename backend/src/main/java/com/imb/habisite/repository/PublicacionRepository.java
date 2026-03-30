package com.imb.habisite.repository;

import com.imb.habisite.model.Publicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {
    List<Publicacion> findAllByOrderByCreadoEnDesc();
    List<Publicacion> findByPublicadoTrueOrderByCreadoEnDesc();
}
