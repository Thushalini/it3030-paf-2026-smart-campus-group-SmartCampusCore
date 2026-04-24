package com.sliit.campus_core.ticket.service.impl;

import com.sliit.campus_core.dto.NotificationRequestDTO;
import com.sliit.campus_core.repository.UserRepository;
import com.sliit.campus_core.service.NotificationService;
import com.sliit.campus_core.ticket.service.NotificationPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TicketNotificationPublisherImpl implements NotificationPublisher {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void publishTicketCreated(NotificationRequestDTO req) {
        sendNotification(req.getRecipientUserId(), req.getMessage(), "TICKET");
    }

    @Override
    public void publishStatusChanged(NotificationRequestDTO req) {
        sendNotification(req.getRecipientUserId(), req.getMessage(), "TICKET");
    }

    @Override
    public void publishTechnicianAssigned(NotificationRequestDTO req) {
        sendNotification(req.getRecipientUserId(), req.getMessage(), "TICKET");
    }

    @Override
    public void publishCommentAdded(NotificationRequestDTO req) {
        sendNotification(req.getRecipientUserId(), req.getMessage(), "COMMENT");
    }

    @Override
    public void publishCommentUpdated(NotificationRequestDTO req) {
        sendNotification(req.getRecipientUserId(), req.getMessage(), "COMMENT");
    }

    @Override
    public void publishCommentDeleted(NotificationRequestDTO req) {
        sendNotification(req.getRecipientUserId(), req.getMessage(), "COMMENT");
    }

    private void sendNotification(String userId, String message, String type) {
        userRepository.findById(userId).ifPresent(user -> {
            notificationService.sendNotification(user, message, type);
        });
    }
}