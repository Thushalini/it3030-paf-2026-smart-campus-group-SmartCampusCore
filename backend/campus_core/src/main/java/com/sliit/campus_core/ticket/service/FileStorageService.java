package com.sliit.campus_core.ticket.service;

import jakarta.servlet.http.Part;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file);
    String storeFile(Part part);
    void deleteFile(String filePath);
    String getFileUrl(String filePath);
}
