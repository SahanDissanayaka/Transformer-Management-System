package com.TransformerUI.TransformerUI.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Dev-only controller to list and download preserved failed-detection images.
 * NOTE: keep this dev-only; remove or protect in production.
 */
@RestController
@RequestMapping("/dev/failed-detections")
public class DevFailedDetectionsController {

    private Path getDebugDir() {
        // try common locations relative to user.dir
        String cwd = System.getProperty("user.dir");
        Path p1 = Paths.get(cwd, "python", "..", "failed-detections").normalize();
        if (Files.exists(p1)) return p1;
        Path p2 = Paths.get(cwd, "backend", "python", "..", "failed-detections").normalize();
        if (Files.exists(p2)) return p2;
        // fallback to user home local AppData used in earlier errors
        Path p3 = Paths.get(System.getProperty("user.home"), "AppData", "Local", "failed-detections");
        return p3;
    }

    @GetMapping("")
    public List<String> listFiles() throws Exception {
        Path dir = getDebugDir();
        if (!Files.exists(dir)) return List.of();
        return Files.list(dir)
                .filter(Files::isRegularFile)
                .map(p -> p.getFileName().toString())
                .sorted((a,b)->b.compareTo(a))
                .collect(Collectors.toList());
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws MalformedURLException {
        Path dir = getDebugDir();
        Path file = dir.resolve(fileName).normalize();
        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(file.toUri());
        String contentType = "application/octet-stream";
        try { contentType = Files.probeContentType(file); } catch (Exception ignored) {}
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName().toString() + "\"")
                .body(resource);
    }
}
