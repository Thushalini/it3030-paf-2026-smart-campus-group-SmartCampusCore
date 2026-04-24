package com.sliit.campus_core.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification_logs")
public class NotificationLog {

    @Id
    private String id;

    private String sentByEmail;       // admin who sent it
    private String targetRole;        // "ALL", "TECHNICIAN", "USER", etc.
    private String message;
    private String type;
    private LocalDateTime sentAt;
    private int recipientCount;

    // Getters & Setters
    public String getId() { return id; }

    public String getSentByEmail() { return sentByEmail; }
    public void setSentByEmail(String sentByEmail) { this.sentByEmail = sentByEmail; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public int getRecipientCount() { return recipientCount; }
    public void setRecipientCount(int recipientCount) { this.recipientCount = recipientCount; }
}