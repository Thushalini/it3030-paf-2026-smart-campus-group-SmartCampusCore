package com.sliit.campus_core.dto.ticket;

import com.sliit.campus_core.ticket.model.enums.TicketCategory;
import com.sliit.campus_core.ticket.model.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketCreateRequestDTO {
    @NotBlank
    @Size(max = 100)
    private String title;

    private String resourceId;
    private String resourceName;

    @NotBlank
    private String location;

    @NotNull
    private TicketCategory category;

    @NotBlank
    @Size(max = 1000)
    private String description;

    @NotNull
    private TicketPriority priority;

    @NotNull
    private ContactDetailsDTO contactDetails;   
}
