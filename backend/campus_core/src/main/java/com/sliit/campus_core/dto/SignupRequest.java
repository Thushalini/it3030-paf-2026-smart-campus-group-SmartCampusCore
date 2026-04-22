package com.sliit.campus_core.dto;

public class SignupRequest {

    private String name;
    private String email;
    private String password;
    private String role;

    private String phone;
    private String department;

    private String userType;
    private String studentId;
    private String staffId;
    private String profileImage;

    // 🔹 Notification preferences
    private boolean bookingNotifications = true;
    private boolean ticketNotifications = true;
    private boolean commentNotifications = true;

    // ================= GETTERS & SETTERS =================

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public boolean isBookingNotifications() { return bookingNotifications; }
    public void setBookingNotifications(boolean bookingNotifications) { this.bookingNotifications = bookingNotifications; }

    public boolean isTicketNotifications() { return ticketNotifications; }
    public void setTicketNotifications(boolean ticketNotifications) { this.ticketNotifications = ticketNotifications; }

    public boolean isCommentNotifications() { return commentNotifications; }
    public void setCommentNotifications(boolean commentNotifications) { this.commentNotifications = commentNotifications; }
}