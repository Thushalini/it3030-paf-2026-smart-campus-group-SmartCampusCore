package com.sliit.campus_core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.service.UserService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    // ✅ Get my profile
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(userService.getMyProfile(token));
    }

    // ✅ Update my profile (ONLY own data)
    @PutMapping("/update")
    public ResponseEntity<User> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody User user) {

        return ResponseEntity.ok(userService.updateProfile(token, user));
    }

    // ✅ Disable my account
    @DeleteMapping("/disable")
    public ResponseEntity<String> disableAccount(@RequestHeader("Authorization") String token) {
        userService.disableAccount(token);
        return ResponseEntity.ok("Account disabled");
    }

    // ✅ Upload profile picture
    @PostMapping("/upload-pic")
    public ResponseEntity<String> uploadPic(
            @RequestHeader("Authorization") String token,
            @RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok(userService.uploadProfilePic(token, file));
    }
}