package com.sliit.campus_core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.campus_core.entity.User;
import com.sliit.campus_core.entity.Role;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    Optional<User> findByResetToken(String resetToken);
}