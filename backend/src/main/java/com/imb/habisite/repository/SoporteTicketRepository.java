package com.imb.habisite.repository;

import com.imb.habisite.model.SoporteTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SoporteTicketRepository extends JpaRepository<SoporteTicket, Long> {
    List<SoporteTicket> findAllByOrderByCreadoEnDesc();
    List<SoporteTicket> findByResueltoFalseOrderByCreadoEnDesc();
}
