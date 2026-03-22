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

    @Autowired
    private NotificationRepository repository;

    public void sendNotification(User user, String message) {
        Notification n = new Notification();
        n.setUserId(user.getId());
        n.setMessage(message);
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
