package com.sliit.campus_core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.service.AuthService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuthService authService;

    // 🔒 Only ADMIN can access this
    @PutMapping("/assign-role/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public User assignRole(@PathVariable String id,
                           @RequestParam Role role) {

        return authService.assignRole(id, role);
    }
}