package com.sliit.campus_core.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.Status;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.entity.UserType;
import com.sliit.campus_core.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public User getByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User createIfNotExists(String name, String email, Role role) {
        return repository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setRole(role);

            // 🔹 Default values
            user.setStatus(Status.ACTIVE);
            user.setProvider("OAUTH"); // or GOOGLE

            return repository.save(user);
        });
    }

    // ✅ GET all users
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    // ✅ GET user by ID
    public User getUserById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ CREATE user
    public User createUser(User user) {
        return repository.save(user);
    }

    // ✅ UPDATE user
    public User updateUser(String id, User updatedUser) {

        User existingUser = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔹 Basic fields
        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setDepartment(updatedUser.getDepartment());

        // 🔹 User type logic
        existingUser.setUserType(updatedUser.getUserType());

        if (updatedUser.getUserType() == UserType.STUDENT) {
            if (updatedUser.getStudentId() == null) {
                throw new RuntimeException("Student ID required");
            }
            existingUser.setStudentId(updatedUser.getStudentId());
            existingUser.setStaffId(null);
        } 
        else if (updatedUser.getUserType() == UserType.STAFF) {
            if (updatedUser.getStaffId() == null) {
                throw new RuntimeException("Staff ID required");
            }
            existingUser.setStaffId(updatedUser.getStaffId());
            existingUser.setStudentId(null);
        }

        // 🔹 Optional fields
        existingUser.setProfileImage(updatedUser.getProfileImage());

        // 🔹 Notification preferences
        existingUser.setBookingNotifications(updatedUser.isBookingNotifications());
        existingUser.setTicketNotifications(updatedUser.isTicketNotifications());
        existingUser.setCommentNotifications(updatedUser.isCommentNotifications());

        return repository.save(existingUser);
    }

    public User updateUserRole(String id, Role role) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(role);
        return repository.save(user);
    }

    // ✅ DELETE user
    public void deleteUser(String id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        User user = getUserById(id);
        user.setStatus(Status.DISABLED);
        repository.save(user);
    }
}