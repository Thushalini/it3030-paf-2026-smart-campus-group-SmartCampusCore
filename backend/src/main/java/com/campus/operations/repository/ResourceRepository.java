package com.campus.operations.repository;

import com.campus.operations.entity.Resource;
import com.campus.operations.entity.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    
    List<Resource> findByStatus(ResourceStatus status);
    
    List<Resource> findByStatusOrderByName(ResourceStatus status);
}
