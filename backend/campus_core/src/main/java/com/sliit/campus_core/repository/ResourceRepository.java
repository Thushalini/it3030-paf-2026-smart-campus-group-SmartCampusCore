package com.sliit.campus_core.repository;

import com.sliit.campus_core.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}