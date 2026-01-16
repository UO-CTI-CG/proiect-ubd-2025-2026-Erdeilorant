package com.foodiego.controller;

import com.foodiego.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/restaurant")
    public ResponseEntity<Map<String, String>> uploadRestaurantImage(@RequestParam("file") MultipartFile file) {
        log.info("Uploading restaurant image: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        if (!isImageFile(file)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        String fileUrl = fileStorageService.storeFile(file, "restaurants");

        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        response.put("message", "File uploaded successfully");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/menu-item")
    public ResponseEntity<Map<String, String>> uploadMenuItemImage(@RequestParam("file") MultipartFile file) {
        log.info("Uploading menu item image: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        if (!isImageFile(file)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        String fileUrl = fileStorageService.storeFile(file, "menu-items");

        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        response.put("message", "File uploaded successfully");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteFile(@RequestParam("url") String fileUrl) {
        log.info("Deleting file: {}", fileUrl);

        fileStorageService.deleteFile(fileUrl);

        return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
    }

    private boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }
}
