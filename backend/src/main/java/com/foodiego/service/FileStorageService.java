package com.foodiego.service;

import com.foodiego.exception.FileStorageException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation.resolve("restaurants"));
            Files.createDirectories(this.fileStorageLocation.resolve("menu-items"));
            log.info("File storage initialized at: {}", this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create upload directory", ex);
        }
    }

    public String storeFile(MultipartFile file, String category) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            if (originalFilename.contains("..")) {
                throw new FileStorageException("Invalid file path: " + originalFilename);
            }

            String fileExtension = "";
            int lastDotIndex = originalFilename.lastIndexOf('.');
            if (lastDotIndex > 0) {
                fileExtension = originalFilename.substring(lastDotIndex);
            }

            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path categoryPath = this.fileStorageLocation.resolve(category);
            Path targetLocation = categoryPath.resolve(fileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/" + category + "/" + fileName;
            log.info("File stored successfully: {}", fileUrl);
            return fileUrl;

        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + originalFilename, ex);
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                return;
            }

            String fileName = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new FileStorageException("Invalid file path");
            }

            Files.deleteIfExists(filePath);
            log.info("File deleted successfully: {}", fileUrl);

        } catch (IOException ex) {
            log.error("Could not delete file: {}", fileUrl, ex);
        }
    }

    public Path getFileStorageLocation() {
        return fileStorageLocation;
    }
}
