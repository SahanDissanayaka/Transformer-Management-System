package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.entity.ImageDataEntity;
import com.TransformerUI.TransformerUI.entity.InspectionDataEntity;
import com.TransformerUI.TransformerUI.service.util.SequenceGeneratorService;
import com.TransformerUI.TransformerUI.transport.request.ImageRequest;
import com.TransformerUI.TransformerUI.transport.request.InspectionDataRequest;
import com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse;
import com.TransformerUI.TransformerUI.transport.response.Anomaly;
import com.TransformerUI.TransformerUI.transport.response.ImageResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.io.IOException;

@Component
public class CustomMapper {

    private static final String INSPECTION_SEQUENCE = "inspectiondata_seq";

    private static final SimpleDateFormat inputFormat =
            new SimpleDateFormat("yyyy-MM-dd hh:mm a");
    private static final SimpleDateFormat outputFormat =
            new SimpleDateFormat("EEE(dd), MMM, yyyy hh:mm a");

    private final SequenceGeneratorService sequenceGeneratorService;

    public CustomMapper(SequenceGeneratorService sequenceGeneratorService) {
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    // ===== InspectionData mapping =====
    public InspectionDataEntity toEntity(InspectionDataRequest request) {
        String inspectedDate = formatInspectionDate(request.getInspectionDate(), request.getTime());

        return InspectionDataEntity.builder()
                .branch(request.getBranch())
                .transformerNo(request.getTransformerNo())
                .inspectedDate(inspectedDate)
                .status("Pending") // default
                .build();
    }

    public void updateEntity(InspectionDataEntity existingEntity, InspectionDataRequest request) {
        if (request.getBranch() != null) {
            existingEntity.setBranch(request.getBranch());
        }

        if (request.getTransformerNo() != null) {
            existingEntity.setTransformerNo(request.getTransformerNo());
        }

        if (request.getInspectionDate() != null && request.getTime() != null) {
            String inspectedDate = formatInspectionDate(request.getInspectionDate(), request.getTime());
            existingEntity.setInspectedDate(inspectedDate);
        }
    }

    private String formatInspectionDate(String inspectionDate, String time) {
        try {
            if (inspectionDate != null && time != null) {
                String combined = inspectionDate + " " + time;
                Date parsedDate = inputFormat.parse(combined);
                return outputFormat.format(parsedDate);
            }
        } catch (ParseException e) {
            throw new RuntimeException("Invalid date/time format: " + inspectionDate + " " + time, e);
        }
        return null;
    }

    public ImageDataEntity toEntity(ImageRequest imageRequest) {
        try {
            byte[] imageBytes = imageRequest.getPhoto().getBytes();
            String detectionJson;

            if (Objects.equals(imageRequest.getType(), "Thermal")) {
                // Run Python YOLO and get structured anomalies
                AnomaliesResponse anomaliesResponse = PythonYOLO.runYOLO(imageBytes);

                // Convert back to JSON string for DB storage
                ObjectMapper mapper = new ObjectMapper();
                detectionJson = mapper.writeValueAsString(anomaliesResponse.getAnomalies());
            } else {
                detectionJson = "";
            }

            return ImageDataEntity.builder()
                    .type(imageRequest.getType())
                    .transformerNo(imageRequest.getTransformerNo())
                    .inspectionNo(imageRequest.getInspectionNo())
                    .weather(imageRequest.getWeather())
                    .image(imageBytes)
                    .detectionJson(detectionJson)
                    .build();

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Failed to process image with YOLO", e);
        }
    }


    public void updateEntity(ImageDataEntity existingEntity, ImageRequest imageRequest) {
        if (imageRequest.getType() != null) {
            existingEntity.setType(imageRequest.getType());
        }
        if (imageRequest.getTransformerNo() != null) {
            existingEntity.setTransformerNo(imageRequest.getTransformerNo());
        }
        if (imageRequest.getInspectionNo() != null) {
            existingEntity.setInspectionNo(imageRequest.getInspectionNo());
        }
        if (imageRequest.getPhoto() != null && !imageRequest.getPhoto().isEmpty()) {
            try {
                existingEntity.setImage(imageRequest.getPhoto().getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read image bytes", e);
            }
        }
    }

    public ImageResponse toResponse(ImageDataEntity entity) {
        if (entity == null) return null;

        String photoBase64 = null;
        if (entity.getImage() != null && entity.getImage().length > 0) {
            photoBase64 = Base64.getEncoder().encodeToString(entity.getImage());
        }

        AnomaliesResponse anomaliesResponse = null;
        if (entity.getDetectionJson() != null && !entity.getDetectionJson().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                List<Anomaly> anomalies = mapper.readValue(
                        entity.getDetectionJson(),
                        new TypeReference<List<Anomaly>>() {}
                );
                anomaliesResponse = new AnomaliesResponse(anomalies);
            } catch (Exception e) {
                // log error but don't break response
                anomaliesResponse = null;
            }
        }

        return new ImageResponse(
                entity.getId(),
                entity.getTransformerNo(),
                entity.getInspectionNo(),
                entity.getType(),
                entity.getWeather(),
                anomaliesResponse,
                entity.getDateTime(),
                photoBase64
        );
    }


}
