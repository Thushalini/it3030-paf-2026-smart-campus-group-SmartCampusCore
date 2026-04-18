package com.sliit.campus_core.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.campus_core.entity.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndIsReadFalse(String userId);
}



// package com.sliit.campus_core.repository;

// import java.util.List;

// import org.springframework.data.mongodb.repository.MongoRepository;

// import com.sliit.campus_core.entity.Notification;

// public interface NotificationRepository extends MongoRepository<Notification, String> {
//     List<Notification> findByUserId(String userId);
// }
