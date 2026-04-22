package com.sliit.campus_core.ticket.service.impl;

import com.sliit.campus_core.dto.NotificationRequestDTO;
import com.sliit.campus_core.ticket.service.NotificationPublisher;
import org.springframework.stereotype.Service;

@Service
public class NotificationPublisherStub implements NotificationPublisher {

    @Override
    public void publishTicketCreated(NotificationRequestDTO req) {
        System.out.println("[Stub] Ticket created notification → " +
                "Recipient: " + req.getRecipientUserId() +
                ", Title: " + req.getTitle() +
                ", Message: " + req.getMessage() +
                ", RefId: " + req.getReferenceId());
    }

    @Override
    public void publishStatusChanged(NotificationRequestDTO req) {
        System.out.println("[Stub] Ticket status changed notification → " +
                "Recipient: " + req.getRecipientUserId() +
                ", Title: " + req.getTitle() +
                ", Message: " + req.getMessage() +
                ", RefId: " + req.getReferenceId());
    }

    @Override
    public void publishTechnicianAssigned(NotificationRequestDTO req) {
        System.out.println("[Stub] Technician assigned notification → " +
                "Recipient: " + req.getRecipientUserId() +
                ", Title: " + req.getTitle() +
                ", Message: " + req.getMessage() +
                ", RefId: " + req.getReferenceId());
    }

    @Override
    public void publishCommentAdded(NotificationRequestDTO req) {
        System.out.println("[Stub] Comment added notification → " +
                "Recipient: " + req.getRecipientUserId() +
                ", Title: " + req.getTitle() +
                ", Message: " + req.getMessage() +
                ", RefId: " + req.getReferenceId());
    }

    @Override
    public void publishCommentUpdated(NotificationRequestDTO req) {
        System.out.println("[Stub] Comment updated notification → " +
                "Recipient: " + req.getRecipientUserId() +
                ", Title: " + req.getTitle() +
                ", Message: " + req.getMessage() +
                ", RefId: " + req.getReferenceId());
    }

    @Override
    public void publishCommentDeleted(NotificationRequestDTO req) {
        System.out.println("[Stub] Comment deleted notification → " +
                "Recipient: " + req.getRecipientUserId() +
                ", Title: " + req.getTitle() +
                ", Message: " + req.getMessage() +
                ", RefId: " + req.getReferenceId());
    }

    // TODO: Replace this stub with Member 4’s NotificationService bean when integration is ready.
}