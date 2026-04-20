package com.sliit.campus_core.ticket.controller;

import com.sliit.campus_core.dto.ApiResponse;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {
    @Autowired
    private MongoTemplate mongoTemplate;

    // GET /api/v1/resources → list all resources
    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllResources() {
        List<Document> docs = mongoTemplate.findAll(Document.class, "resources");
        List<Map<String, Object>> resources = new ArrayList<>();

        for (Document doc : docs) {
            Map<String, Object> map = new HashMap<>(doc);
            if (doc.getObjectId("_id") != null) {
                map.put("_id", doc.getObjectId("_id").toHexString());
            }
            resources.add(map);
        }
        return ResponseEntity.ok(ApiResponse.success("Resources fetched successfully", resources));
    }

    // GET /api/v1/resources/{id} → single resource
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getResourceById(@PathVariable String id) {
        Document doc = mongoTemplate.findById(id, Document.class, "resources");
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> map = new HashMap<>(doc);
        ObjectId oid = doc.getObjectId("_id");
        if (oid != null) {
            map.put("_id", oid.toHexString());
        }
        return ResponseEntity.ok(ApiResponse.success("Resource fetched successfully", map));
    }
}
