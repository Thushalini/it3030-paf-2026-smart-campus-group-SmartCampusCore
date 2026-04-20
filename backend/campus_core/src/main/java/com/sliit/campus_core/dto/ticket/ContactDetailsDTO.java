package com.sliit.campus_core.dto.ticket;

import com.sliit.campus_core.ticket.model.ContactDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactDetailsDTO {
    private String contactName;
    private String email;
    private String phone;
    private ContactDetails.PreferredMethod preferredMethod;

    // Convert DTO → Entity
    public ContactDetails toEntity() {
        ContactDetails entity = new ContactDetails();
        entity.setContactName(this.contactName);
        entity.setEmail(this.email);
        entity.setPhone(this.phone);
        entity.setPreferredMethod(this.preferredMethod);
        return entity;
    }

    // Convert Entity → DTO
    public static ContactDetailsDTO fromEntity(ContactDetails entity) {
        if (entity == null) return null;
        ContactDetailsDTO dto = new ContactDetailsDTO();
        dto.setContactName(entity.getContactName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setPreferredMethod(entity.getPreferredMethod());
        return dto;
    }
}
