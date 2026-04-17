package com.sliit.campus_core.ticket.service.impl;

import com.sliit.campus_core.ticket.exception.InvalidFileTypeException;
import com.sliit.campus_core.ticket.service.FileStorageService;
import jakarta.servlet.http.Part;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.max-size}")
    private long maxFileSize;

    @Override
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileTypeException("File is empty");
        }
        if (file.getSize() > maxFileSize) {
            throw new InvalidFileTypeException("File exceeds max size of 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") ||
                                    contentType.equals("image/png") ||
                                    contentType.equals("image/webp"))) {
            throw new InvalidFileTypeException("Only JPEG, PNG, WEBP images allowed");
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path target = Paths.get(uploadDir).resolve(filename);

        try {
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + filename, e);
        }

        return "/uploads/" + filename;
    }

    @Override
    public String storeFile(Part part) {
        if (part == null || part.getSize() == 0) {
            throw new InvalidFileTypeException("File is empty");
        }
        if (part.getSize() > maxFileSize) {
            throw new InvalidFileTypeException("File exceeds max size of 5MB");
        }
        String contentType = part.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") ||
                                    contentType.equals("image/png") ||
                                    contentType.equals("image/webp"))) {
            throw new InvalidFileTypeException("Only JPEG, PNG, WEBP images allowed");
        }

        String originalFilename = Paths.get(part.getSubmittedFileName()).getFileName().toString();
        String filename = UUID.randomUUID() + "_" + originalFilename;
        Path target = Paths.get(uploadDir).resolve(filename);

        try {
            Files.createDirectories(target.getParent());
            Files.copy(part.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + filename, e);
        }

        return "/uploads/" + filename;
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(uploadDir).resolve(filePath));
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file " + filePath, e);
        }
    }

    @Override
    public String getFileUrl(String filePath) {
        return "/uploads/" + filePath;
    }
}

