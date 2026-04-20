package com.campus.operations.config;

import com.campus.operations.entity.Resource;
import com.campus.operations.entity.ResourceStatus;
import com.campus.operations.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(ResourceRepository resourceRepository) {
        return args -> {
            // Check if resources already exist
            if (resourceRepository.count() == 0) {
                // Add sample resources
                resourceRepository.save(new Resource(
                    "Conference Room A",
                    "Large conference room with projector and whiteboard",
                    "Building A, Floor 2",
                    20,
                    LocalTime.of(9, 0),
                    LocalTime.of(18, 0),
                    ResourceStatus.ACTIVE
                ));

                resourceRepository.save(new Resource(
                    "Computer Lab 1",
                    "Computer lab with 30 workstations",
                    "Building B, Floor 1",
                    30,
                    LocalTime.of(8, 0),
                    LocalTime.of(22, 0),
                    ResourceStatus.ACTIVE
                ));

                resourceRepository.save(new Resource(
                    "Study Room 101",
                    "Small study room for group discussions",
                    "Library, Floor 1",
                    6,
                    LocalTime.of(9, 0),
                    LocalTime.of(21, 0),
                    ResourceStatus.ACTIVE
                ));

                resourceRepository.save(new Resource(
                    "Auditorium",
                    "Main auditorium for large events",
                    "Building C, Ground Floor",
                    200,
                    LocalTime.of(8, 0),
                    LocalTime.of(22, 0),
                    ResourceStatus.ACTIVE
                ));

                resourceRepository.save(new Resource(
                    "Meeting Room B",
                    "Small meeting room for team discussions",
                    "Building A, Floor 3",
                    8,
                    LocalTime.of(9, 0),
                    LocalTime.of(18, 0),
                    ResourceStatus.ACTIVE
                ));

                resourceRepository.save(new Resource(
                    "Physics Lab",
                    "Physics laboratory with equipment",
                    "Science Building, Floor 2",
                    25,
                    LocalTime.of(8, 0),
                    LocalTime.of(17, 0),
                    ResourceStatus.ACTIVE
                ));

                resourceRepository.save(new Resource(
                    "Library Study Area",
                    "Open study area in the library",
                    "Library, Floor 2",
                    50,
                    LocalTime.of(8, 0),
                    LocalTime.of(22, 0),
                    ResourceStatus.ACTIVE
                ));

                resourceRepository.save(new Resource(
                    "Sports Hall",
                    "Indoor sports facility",
                    "Sports Complex",
                    100,
                    LocalTime.of(6, 0),
                    LocalTime.of(22, 0),
                    ResourceStatus.ACTIVE
                ));

                System.out.println("Sample resources have been loaded into H2 database!");
            }
        };
    }
}
