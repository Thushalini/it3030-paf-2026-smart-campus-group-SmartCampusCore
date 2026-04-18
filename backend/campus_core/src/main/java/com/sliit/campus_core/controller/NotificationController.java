package com.sliit.campus_core.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.service.NotificationService;
import com.sliit.campus_core.service.UserService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<?> getNotifications(Authentication auth) {
        User user = userService.getByEmail(auth.getName());
        return notificationService.getUserNotifications(user);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(Authentication auth) {
        User user = userService.getByEmail(auth.getName());
        return notificationService.getUnreadCount(user);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/mark-all-read")
    public void markAllRead(Authentication auth) {
        User user = userService.getByEmail(auth.getName());
        notificationService.markAllAsRead(user);
    }
}