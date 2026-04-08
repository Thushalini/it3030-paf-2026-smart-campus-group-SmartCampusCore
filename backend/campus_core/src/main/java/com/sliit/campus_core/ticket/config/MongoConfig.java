package com.sliit.campus_core.ticket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // No extra beans needed for now.
    // This enables @CreatedDate and @LastModifiedDate in your models.  
}
