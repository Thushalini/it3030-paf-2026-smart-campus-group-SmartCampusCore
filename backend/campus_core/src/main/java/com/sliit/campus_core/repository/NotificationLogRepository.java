package com.sliit.campus_core.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.campus_core.entity.NotificationLog;

public interface NotificationLogRepository extends MongoRepository<NotificationLog, String> {
    List<NotificationLog> findAllByOrderBySentAtDesc();
}