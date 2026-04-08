package com.sliit.campus_core.ticket.repository;

import com.sliit.campus_core.ticket.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    //add custom query methods
}
