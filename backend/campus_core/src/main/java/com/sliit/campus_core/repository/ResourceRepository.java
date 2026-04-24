package com.sliit.campus_core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sliit.campus_core.entity.Resource;
import com.sliit.campus_core.entity.ResourceStatus;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    Optional<Resource> findByResourceCode(String resourceCode);
    boolean existsByResourceCode(String resourceCode);

    List<Resource> findByStatusOrderByName(ResourceStatus status);
}