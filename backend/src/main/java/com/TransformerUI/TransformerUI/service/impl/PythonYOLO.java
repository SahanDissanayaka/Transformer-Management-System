package com.TransformerUI.TransformerUI.service.impl;


import com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse;
import com.TransformerUI.TransformerUI.transport.response.Anomaly;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class PythonYOLO {

    public static AnomaliesResponse runYOLO(byte[] imageBytes) throws IOException, InterruptedException {
        // Save image temporarily
        Path tempFile = Files.createTempFile("image", ".jpg");
        Files.write(tempFile, imageBytes);

        // Run Python script
        ProcessBuilder pb = new ProcessBuilder("python", "python/anomaly_detection.py", tempFile.toString());
        pb.redirectErrorStream(true);
        Process process = pb.start();

        // Read output
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line);
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Python YOLO script failed with exit code " + exitCode);
        }

        // Delete temp image
        Files.delete(tempFile);

        // Extract JSON part (starts with "[{")
        String resultStr = output.toString();
        int jsonStart = resultStr.indexOf("[{");

        List<Anomaly> anomalies;

        if (jsonStart == -1) {
            anomalies = null;
        } else {
            String json = resultStr.substring(jsonStart);
            // Parse JSON to List<Anomaly>
            ObjectMapper mapper = new ObjectMapper();
            anomalies = mapper.readValue(json, new TypeReference<List<Anomaly>>() {});
        }

        return new AnomaliesResponse(anomalies);

    }
}
