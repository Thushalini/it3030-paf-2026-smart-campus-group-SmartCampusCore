package com.sliit.campus_core.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public User getByEmail(String email) {
        return repository.findByEmail(email).orElseThrow();
    }

    public User createIfNotExists(String name, String email) {
        return repository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setRole(Role.USER);
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

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setRole(updatedUser.getRole());

        return repository.save(existingUser);
    }

    // ✅ DELETE user
    public void deleteUser(String id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        repository.deleteById(id);
    }
}