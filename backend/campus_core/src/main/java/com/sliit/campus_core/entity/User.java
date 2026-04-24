package com.sliit.campus_core.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    // 🔹 Basic fields
    private String name;
    private String email;
    private String password;
    private Role role;

    private String phone;
    private String department; // IT, Engineering, etc.
    private Status status;     // ACTIVE / DISABLED
    
    private UserType userType;  // STUDENT / STAFF

    private String studentId;
    private String staffId;
    private String profileImage; // URL or file path

    @CreatedDate
    private LocalDateTime createdAt;

    private String provider;

    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    // 🔹 Notification preferences (already good 👍)
    private boolean bookingNotifications = true;
    private boolean ticketNotifications = true;
    private boolean commentNotifications = true;

    // ================= GETTERS & SETTERS =================

    public String getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public UserType getUserType() { return userType; }
    public void setUserType(UserType userType) { this.userType = userType; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }

    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }

    public boolean isBookingNotifications() { return bookingNotifications; }
    public void setBookingNotifications(boolean bookingNotifications) { this.bookingNotifications = bookingNotifications; }

    public boolean isTicketNotifications() { return ticketNotifications; }
    public void setTicketNotifications(boolean ticketNotifications) { this.ticketNotifications = ticketNotifications; }

    public boolean isCommentNotifications() { return commentNotifications; }
    public void setCommentNotifications(boolean commentNotifications) { this.commentNotifications = commentNotifications; }
}