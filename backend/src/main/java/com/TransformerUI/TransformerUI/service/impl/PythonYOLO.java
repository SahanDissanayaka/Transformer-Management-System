package com.TransformerUI.TransformerUI.service.impl;


import com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse;
import com.TransformerUI.TransformerUI.transport.response.Anomaly;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Collections;

public class PythonYOLO {

    public static AnomaliesResponse runYOLO(byte[] imageBytes) throws IOException, InterruptedException {
        // Save image temporarily
        Path tempFile = Files.createTempFile("image", ".jpg");
        Files.write(tempFile, imageBytes);

        // Run Python script. Allow overriding python via system property or env var.
        String pythonCmd = System.getProperty("python.exec");
        if (pythonCmd == null || pythonCmd.isBlank()) {
            String env = System.getenv("PYTHON_EXEC");
            pythonCmd = (env == null || env.isBlank()) ? "python" : env;
        }

        // Resolve the python script path robustly. Try common locations relative to the JVM working dir
        String cwd = System.getProperty("user.dir");
        Path scriptPath = Paths.get(cwd, "python", "anomaly_detection.py");
        if (!Files.exists(scriptPath)) {
            // If running from repo root where backend is a subfolder
            scriptPath = Paths.get(cwd, "backend", "python", "anomaly_detection.py");
        }
        if (!Files.exists(scriptPath)) {
            // Fallback to the original relative path (let OS resolve from current CWD)
            scriptPath = Paths.get("python", "anomaly_detection.py");
        }

    // Pass the --image flag expected by anomaly_detection.py
    ProcessBuilder pb = new ProcessBuilder(pythonCmd, scriptPath.toString(), "--image", tempFile.toString());
        // Keep stderr separate so we can include useful error messages
        pb.redirectErrorStream(false);
        Process process = pb.start();

        // Read stdout
        BufferedReader stdout = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder outBuf = new StringBuilder();
        String line;
        while ((line = stdout.readLine()) != null) {
            outBuf.append(line).append('\n');
        }

        // Read stderr
        BufferedReader stderr = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        StringBuilder errBuf = new StringBuilder();
        while ((line = stderr.readLine()) != null) {
            errBuf.append(line).append('\n');
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            // include stderr for debugging and preserve the temp image for offline inspection
            String err = errBuf.length() > 0 ? errBuf.toString() : "Python script exited with code " + exitCode;
            // create a debug folder next to project root
            Path debugDir = tempFile.getParent().resolve("../failed-detections").normalize();
            try {
                Files.createDirectories(debugDir);
                Path preserved = debugDir.resolve("failed_" + System.currentTimeMillis() + ".jpg");
                Files.copy(tempFile, preserved);
                throw new RuntimeException("PY_ERR;FILE:" + preserved.toString() + ";ERR:" + err);
            } catch (IOException ioEx) {
                throw new RuntimeException("PY_ERR;FILE:UNKNOWN;ERR:" + err);
            }
        }

        // Delete temp image
        Files.delete(tempFile);

        String resultStr = outBuf.toString().trim();
        // Try to extract JSON array/object from stdout. If script prints logs
        // before JSON, attempt to find the JSON bracket. Otherwise parse the whole.
        String json = resultStr;
        int arrStart = resultStr.indexOf("[");
        int objStart = resultStr.indexOf("{");
        if (arrStart != -1 && (arrStart < objStart || objStart == -1)) {
            json = resultStr.substring(arrStart);
        } else if (objStart != -1) {
            json = resultStr.substring(objStart);
        }

        ObjectMapper mapper = new ObjectMapper();
        List<Anomaly> anomalies;
        try {
            // If JSON is an object with "anomalies" field, parse that
            if (json.startsWith("{")) {
                com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(json);
                if (node.has("anomalies")) {
                    anomalies = mapper.convertValue(node.get("anomalies"), new TypeReference<List<Anomaly>>() {});
                } else {
                    // try parse as list inside object
                    anomalies = Collections.emptyList();
                }
            } else if (json.startsWith("[")) {
                anomalies = mapper.readValue(json, new TypeReference<List<Anomaly>>() {});
            } else {
                anomalies = Collections.emptyList();
            }
        } catch (Exception e) {
            // preserve temp image for offline debugging
            Path debugDir = tempFile.getParent().resolve("../failed-detections").normalize();
            try {
                Files.createDirectories(debugDir);
                Path preserved = debugDir.resolve("failed_parse_" + System.currentTimeMillis() + ".jpg");
                Files.copy(tempFile, preserved);
                throw new RuntimeException("PY_PARSE_ERR;FILE:" + preserved.toString() + ";ERR:" + e.getMessage());
            } catch (IOException ioEx) {
                // fallback to empty anomalies
                anomalies = java.util.Collections.emptyList();
                return new AnomaliesResponse(anomalies);
            }
        }

        // Delete temp image on success
        try { Files.deleteIfExists(tempFile); } catch (Exception ignore) {}

        return new AnomaliesResponse(anomalies);

    }
}
