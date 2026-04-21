package com.sliit.campus_core.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.campus_core.entity.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserIdAndIsReadFalse(String userId);
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByTypeOrderByCreatedAtDesc(String type);
    // NotificationRepository.java
    void deleteByMessageAndType(String message, String type);
}



// package com.sliit.campus_core.repository;

// import java.util.List;

// import org.springframework.data.mongodb.repository.MongoRepository;

// import com.sliit.campus_core.entity.Notification;

// public interface NotificationRepository extends MongoRepository<Notification, String> {
//     List<Notification> findByUserId(String userId);
// }
