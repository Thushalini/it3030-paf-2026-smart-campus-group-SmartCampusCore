package com.sliit.campus_core.ticket.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@ConfigurationProperties(prefix = "file")
public class FileStorageConfig implements WebMvcConfigurer {

    /**
     * Bound from application.properties: file.upload-dir=./uploads
     */
    private String uploadDir = "uploads"; // default

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve to absolute path URI
        Path path = Paths.get(uploadDir).toAbsolutePath();
        String location = "file:" + path.toString() + "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}