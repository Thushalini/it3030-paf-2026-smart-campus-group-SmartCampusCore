package com.sliit.campus_core.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sliit.campus_core.dto.NotificationWithEmail;
import com.sliit.campus_core.entity.Notification;
import com.sliit.campus_core.entity.NotificationLog;
import com.sliit.campus_core.entity.Role;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.repository.NotificationLogRepository;
import com.sliit.campus_core.repository.NotificationRepository;
import com.sliit.campus_core.repository.UserRepository;
import com.sliit.campus_core.service.NotificationService;

@RestController
@RequestMapping("/api/admin/notifications")
@CrossOrigin
public class AdminNotificationController {

    @Autowired private NotificationService notificationService;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private NotificationLogRepository logRepository;

    // POST /api/admin/notifications/broadcast
    // Body: { "message": "...", "type": "ANNOUNCEMENT" }
    @PostMapping("/broadcast")
    public ResponseEntity<?> broadcast(@RequestBody Map<String, String> body,
                                       Authentication auth) {
        String message = body.get("message");
        String type    = body.getOrDefault("type", "ANNOUNCEMENT");

        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            notificationService.sendNotification(user, message, type);
        }

        saveLog(auth.getName(), "ALL", message, type, allUsers.size());
        return ResponseEntity.ok(Map.of("sent", allUsers.size()));
    }

    // POST /api/admin/notifications/role/TECHNICIAN
    // Body: { "message": "...", "type": "ANNOUNCEMENT" }
    @PostMapping("/role/{role}")
    public ResponseEntity<?> sendToRole(@PathVariable String role,
                                        @RequestBody Map<String, String> body,
                                        Authentication auth) {
        String message = body.get("message");
        String type    = body.getOrDefault("type", "ANNOUNCEMENT");

        Role targetRole;
        try {
            targetRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + role));
        }

        List<User> users = userRepository.findByRole(targetRole);
        for (User user : users) {
            notificationService.sendNotification(user, message, type);
        }

        saveLog(auth.getName(), role.toUpperCase(), message, type, users.size());
        return ResponseEntity.ok(Map.of("sent", users.size()));
    }

    // GET /api/admin/notifications/history
    @GetMapping("/history")
    public ResponseEntity<List<NotificationLog>> getHistory() {
        return ResponseEntity.ok(logRepository.findAllByOrderBySentAtDesc());
    }

    // DELETE /api/admin/notifications/{id}
    // Deletes the notification from the user's inbox (by notification id)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        if (!notificationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        notificationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    // DELETE /api/admin/notifications/log/{logId}
    // Removes an entry from the admin broadcast history
    @DeleteMapping("/log/{logId}")
        public ResponseEntity<?> deleteLog(@PathVariable String logId) {
        NotificationLog log = logRepository.findById(logId).orElse(null);
        if (log == null) {
            return ResponseEntity.notFound().build();
        }

        // Delete all per-user notifications that were created by this broadcast
        notificationRepository.deleteByMessageAndType(log.getMessage(), log.getType());

        logRepository.deleteById(logId);
        return ResponseEntity.ok(Map.of("deleted", logId));
    }

    private void saveLog(String adminEmail, String targetRole,
                         String message, String type, int count) {
        NotificationLog log = new NotificationLog();
        log.setSentByEmail(adminEmail);
        log.setTargetRole(targetRole);
        log.setMessage(message);
        log.setType(type);
        log.setSentAt(LocalDateTime.now());
        log.setRecipientCount(count);
        logRepository.save(log);
    }

    // @GetMapping("/all")
    // public ResponseEntity<List<Notification>> getAllNotifications(
    //         @RequestParam(required = false) String type) {
    //     List<Notification> all = notificationRepository.findAll(
    //         Sort.by(Sort.Direction.DESC, "createdAt")
    //     );

    //     if (type != null && !type.isBlank()) {
    //         all = all.stream()
    //                 .filter(n -> type.equalsIgnoreCase(n.getType()))
    //                 .collect(Collectors.toList());
    //     } else {
    //         // Exclude ANNOUNCEMENT when no filter is applied
    //         all = all.stream()
    //                 .filter(n -> !"ANNOUNCEMENT".equalsIgnoreCase(n.getType()))
    //                 .collect(Collectors.toList());
    //     }

    //     return ResponseEntity.ok(all);
    // }


    @GetMapping("/all")
    public ResponseEntity<List<NotificationWithEmail>> getAllNotifications(
            @RequestParam(required = false) String type) {

        List<Notification> all = notificationRepository.findAll(
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        if (type != null && !type.isBlank()) {
            all = all.stream()
                    .filter(n -> type.equalsIgnoreCase(n.getType()))
                    .collect(Collectors.toList());
        }

        // Build a userId → email map in one DB call
        List<String> userIds = all.stream()
                .map(Notification::getUserId)
                .distinct()
                .collect(Collectors.toList());

        Map<String, String> emailMap = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, User::getEmail));

        List<NotificationWithEmail> result = all.stream()
                .map(n -> new NotificationWithEmail(
                    n.getId(),
                    n.getUserId(),
                    emailMap.getOrDefault(n.getUserId(), "unknown"), // ← resolved email
                    n.getMessage(),
                    n.getType(),
                    n.isRead(),
                    n.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}