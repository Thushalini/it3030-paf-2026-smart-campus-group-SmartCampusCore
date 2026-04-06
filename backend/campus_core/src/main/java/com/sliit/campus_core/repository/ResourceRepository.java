package com.sliit.campus_core.repository;

import com.sliit.campus_core.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    Optional<Resource> findByResourceCode(String resourceCode);
    boolean existsByResourceCode(String resourceCode);
}