package com.sliit.campus_core.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.campus_core.entity.Notification;
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

    @Autowired
    private SimpMessagingTemplate messagingTemplate;  // for WebSocket push

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

    //test endpoint to send a notification to self
    @PostMapping("/test")
    public ResponseEntity<?> sendTestNotification(Authentication auth) {
        String email = auth.getName();
        User user = userService.getByEmail(email); // ← get the full user object

        Notification n = new Notification();
        n.setMessage("🔔 Test notification at " + LocalDateTime.now());
        n.setType("TEST");
        n.setisRead(false);
        n.setCreatedAt(LocalDateTime.now());
        n.setUserId(user.getId()); // ← use user.getId(), not email
        notificationService.save(n);

        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), n);

        return ResponseEntity.ok("Test notification sent to " + email);
    }
}