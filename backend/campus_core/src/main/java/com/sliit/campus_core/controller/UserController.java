package com.sliit.campus_core.controller;

import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ✅ GET all users (ADMIN only)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ GET user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ✅ CREATE user
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    // ✅ UPDATE user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable String id,
            @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // ✅ DELETE user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}