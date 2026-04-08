package com.sliit.campus_core.ticket;

import com.sliit.campus_core.ticket.model.Ticket;
import com.sliit.campus_core.ticket.model.ContactDetails;
import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import com.sliit.campus_core.ticket.model.enums.TicketStatus;
import com.sliit.campus_core.ticket.repository.TicketRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

@Configuration
public class TestDataLoader {
 
    @Bean
    CommandLineRunner initDatabase(TicketRepository ticketRepository) {
        return args -> {
            // Create dummy contact details
            ContactDetails contact = new ContactDetails();
            contact.setContactName("John Doe");
            contact.setPhone("1234567890");
            contact.setPreferredMethod(ContactDetails.PreferredMethod.PHONE);

            // Create dummy ticket
            Ticket ticket = new Ticket();
            ticket.setTicketNumber("TKT-20240407-0001");
            ticket.setTitle("Projector not working");
            ticket.setLocation("Block A, Lab 204");
            ticket.setCategory(TicketCategory.IT_EQUIPMENT);
            ticket.setDescription("The projector in Lab 204 is not turning on.");
            ticket.setPriority(TicketPriority.HIGH);
            ticket.setStatus(TicketStatus.OPEN);
            ticket.setReportedById("user123");
            ticket.setReportedByName("Alice Student");
            ticket.setReportedByEmail("alice@example.com");
            ticket.setContactDetails(contact);
            ticket.setImageAttachments(Collections.singletonList("/uploads/test.png"));

            // Save to MongoDB
            ticketRepository.save(ticket);

            System.out.println("✅ Dummy ticket inserted into MongoDB");
        };
    }

}
