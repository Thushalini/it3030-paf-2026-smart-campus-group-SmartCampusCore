package com.sliit.campus_core.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.Status;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.service.AuthService;
import com.sliit.campus_core.service.UserService;

@RestController
@RequestMapping("/api/users/admin")
public class AdminController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    // ✅ Assign role
    @PutMapping("/assign-role/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User assignRole(@PathVariable String id,
                           @RequestParam Role role) {

        return authService.assignRole(id, role);
    }

    // ✅ Get all users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ✅ Disable user
    @PutMapping("/disable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String disableUser(@PathVariable String id) {

        userService.deleteUser(id);

        return "User disabled successfully";
    }

    // ✅ Enable user
    @PutMapping("/enable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String enableUser(@PathVariable String id) {

        User user = userService.getUserById(id);

        user.setStatus(Status.ACTIVE);

        userService.createUser(user);

        return "User enabled successfully";
    }

}