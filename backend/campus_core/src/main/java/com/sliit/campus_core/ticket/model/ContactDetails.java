package com.sliit.campus_core.ticket.model;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactDetails {
    private String contactName;
    private String phone;
    private PreferredMethod preferredMethod;

    public enum PreferredMethod {
        EMAIL,
        PHONE,
        IN_PERSON
    }  
}
