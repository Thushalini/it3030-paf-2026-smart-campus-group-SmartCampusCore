package com.sliit.campus_core.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.campus_core.entity.Resource;

import java.util.Optional;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    Optional<Resource> findByResourceCode(String resourceCode);
    boolean existsByResourceCode(String resourceCode);
}