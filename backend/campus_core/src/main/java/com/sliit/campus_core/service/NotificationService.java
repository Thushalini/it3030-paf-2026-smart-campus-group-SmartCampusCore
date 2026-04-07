package com.sliit.campus_core.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sliit.campus_core.entity.Notification;
import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired private NotificationRepository repository;

    // type = "BOOKING", "TICKET", or "COMMENT"
    public void sendNotification(User user, String message, String type) {

        // Check user preferences before saving
        boolean allowed = switch (type) {
            case "BOOKING" -> user.isBookingNotifications();
            case "TICKET"  -> user.isTicketNotifications();
            case "COMMENT" -> user.isCommentNotifications();
            default -> true;
        };

        if (!allowed) return;

        Notification n = new Notification();
        n.setUserId(user.getId());
        n.setMessage(message);
        n.setType(type);
        n.setCreatedAt(LocalDateTime.now());
        n.setRead(false);
        repository.save(n);
    }

    public List<Notification> getUserNotifications(User user) {
        return repository.findByUserId(user.getId());
    }

    public void markAsRead(String id) {
        Notification n = repository.findById(id).orElseThrow();
        n.setRead(true);
        repository.save(n);
    }
}