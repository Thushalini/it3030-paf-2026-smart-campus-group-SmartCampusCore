package com.sliit.campus_core.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.Status;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.entity.UserType;
import com.sliit.campus_core.repository.UserRepository;
import com.sliit.campus_core.security.JwtUtil;


@Service
public class UserService {

    @Autowired
    private UserRepository repository;
    @Autowired 
    private JwtUtil jwtUtil;

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

    public User enableUser(String id) {

        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setStatus(Status.ACTIVE);

        return repository.save(user);
    }

    // ✅ Get logged user from JWT
    public User getLoggedUser(String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ Get My Profile
    public User getMyProfile(String token) {
        return getLoggedUser(token);
    }

    // ✅ Update Profile (ONLY OWN DATA)
    public User updateProfile(String token, User updated) {

        User user = getLoggedUser(token);

        user.setName(updated.getName());
        user.setPhone(updated.getPhone());
        user.setDepartment(updated.getDepartment());

        // 🔹 User type logic
        if (updated.getUserType() != null) {
            user.setUserType(updated.getUserType());

            if (updated.getUserType() == UserType.STUDENT) {
                if (updated.getStudentId() == null || updated.getStudentId().trim().isEmpty()) {
                    throw new RuntimeException("Student ID required");
                }
                user.setStudentId(updated.getStudentId());
                user.setStaffId(null);
            } 
            else if (updated.getUserType() == UserType.STAFF) {
                if (updated.getStaffId() == null || updated.getStaffId().trim().isEmpty()) {
                    throw new RuntimeException("Staff ID required");
                }
                user.setStaffId(updated.getStaffId());
                user.setStudentId(null);
            }
        }

        // optional
        user.setBookingNotifications(updated.isBookingNotifications());
        user.setTicketNotifications(updated.isTicketNotifications());
        user.setCommentNotifications(updated.isCommentNotifications());

        return repository.save(user);
    }

    // ✅ Disable account (soft delete)
    public void disableAccount(String token) {

        User user = getLoggedUser(token);

        user.setStatus(Status.DISABLED);

        repository.save(user);
    }

    // ✅ Upload profile picture
    public String uploadProfilePic(String token, MultipartFile file) {

        User user = getLoggedUser(token);

        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path path = Paths.get("uploads/" + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            user.setProfileImage("/uploads/" + fileName);

            repository.save(user);

            return "Uploaded successfully: " + fileName;

        } catch (IOException e) {
            throw new RuntimeException("File upload failed");
        }
    }
}