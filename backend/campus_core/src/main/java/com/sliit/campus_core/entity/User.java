package com.sliit.campus_core.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private Role role;

    private boolean bookingNotifications = true;
    private boolean ticketNotifications = true;
    private boolean commentNotifications = true;

    // Getters & Setters
    public String getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isBookingNotifications() { return bookingNotifications; }
    public void setBookingNotifications(boolean bookingNotifications) { this.bookingNotifications = bookingNotifications; }

    public boolean isTicketNotifications() { return ticketNotifications; }
    public void setTicketNotifications(boolean ticketNotifications) { this.ticketNotifications = ticketNotifications; }

    public boolean isCommentNotifications() { return commentNotifications; }
    public void setCommentNotifications(boolean commentNotifications) { this.commentNotifications = commentNotifications; }
}