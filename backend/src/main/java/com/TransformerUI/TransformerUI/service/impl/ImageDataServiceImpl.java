package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.entity.ImageDataEntity;
import com.TransformerUI.TransformerUI.repository.ImageDataRepository;
import com.TransformerUI.TransformerUI.service.ImageDataService;
import com.TransformerUI.TransformerUI.service.util.StackTraceTracker;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.ImageRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.ImageResponse;
import com.TransformerUI.TransformerUI.transport.response.ResponseCodeEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageDataServiceImpl implements ImageDataService {

    private final ImageDataRepository imageDataRepository;
    private final CustomMapper customMapper;

    @Override
    public ApiResponse<Void> saveImage(ImageRequest imageRequest) throws BaseException {
        try {
            validateImageRequest(imageRequest);
            Optional<ImageDataEntity> existingOpt = imageDataRepository
                    .findByTransformerNoAndInspectionNoAndType(
                            imageRequest.getTransformerNo(),
                            imageRequest.getInspectionNo(),
                            imageRequest.getType()
                    );

            existingOpt.ifPresent(imageDataRepository::delete);
            ImageDataEntity imageDataEntity = customMapper.toEntity(imageRequest);
            imageDataRepository.save(imageDataEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), null);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(),
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_CREATED.code(), ResponseCodeEnum.IMAGE_NOT_CREATED.message());
        }
    }

    private void validateImageRequest(ImageRequest imageRequest) throws BaseException {
        if (imageRequest.getTransformerNo() == null
                || imageRequest.getInspectionNo() == null
                || imageRequest.getType() == null
                || imageRequest.getPhoto() == null || imageRequest.getPhoto().isEmpty()) {
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(),
                    "Mandatory fields are missing for Image");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ImageResponse> getImage(String transformerNo, String inspectionNo, String type) throws BaseException {
        try {
            Optional<ImageDataEntity> entityOpt =
                    "Baseline".equals(type)
                            ? imageDataRepository.findByTransformerNoAndType(transformerNo, type)
                            : imageDataRepository.findByTransformerNoAndInspectionNoAndType(transformerNo, inspectionNo, type);

            if (entityOpt.isEmpty()) {
                throw new BaseException(
                        String.format("Image not found for Transformer: %s, Inspection: %s", transformerNo, inspectionNo)
                );
            }

            ImageDataEntity imageDataEntity = entityOpt.get();
            ImageResponse response = customMapper.toResponse(imageDataEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), response);
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(),
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_CONNECTED.code(), ResponseCodeEnum.IMAGE_NOT_CONNECTED.message());
        }
    }

    @Override
    public ApiResponse<Void> updateImage(String transformerNo, String inspectionNo, ImageRequest imageRequest) throws BaseException {
        try {
            Optional<ImageDataEntity> entityOpt = imageDataRepository.findByTransformerNoAndInspectionNoAndType(transformerNo, inspectionNo, imageRequest.getType());
            if (entityOpt.isEmpty()) {
                throw new BaseException("Image not found for Transformer: " + transformerNo + ", Inspection: " + inspectionNo);
            }
            ImageDataEntity entity = entityOpt.get();
            customMapper.updateEntity(entity, imageRequest);
            imageDataRepository.save(entity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), null);
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_UPDATED.code(), ResponseCodeEnum.IMAGE_NOT_UPDATED.message());
        }
    }

    @Override
    public ApiResponse<Void> deleteImage(String transformerNo, String inspectionNo) throws BaseException {
        try {
            if (!imageDataRepository.existsByTransformerNoAndInspectionNo(transformerNo, inspectionNo)) {
                throw new BaseException("Image not found for Transformer: " + transformerNo + ", Inspection: " + inspectionNo);
            }
            imageDataRepository.deleteByTransformerNoAndInspectionNo(transformerNo, inspectionNo);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), null);
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_DELETED.code(), ResponseCodeEnum.IMAGE_NOT_DELETED.message());
        }
    }

    @Override
    public ApiResponse<com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse> detectAnomalies(String transformerNo, String inspectionNo) throws BaseException {
        try {
            Optional<ImageDataEntity> entityOpt = imageDataRepository.findByTransformerNoAndInspectionNoAndType(transformerNo, inspectionNo, "Thermal");
            if (entityOpt.isEmpty()) {
                throw new BaseException(ResponseCodeEnum.NOT_FOUND.code(), "Thermal image not found for Transformer: " + transformerNo + ", Inspection: " + inspectionNo);
            }
            ImageDataEntity entity = entityOpt.get();
            byte[] imageBytes = entity.getImage();
            if (imageBytes == null || imageBytes.length == 0) {
                throw new BaseException("Stored image bytes are empty for Transformer: " + transformerNo + ", Inspection: " + inspectionNo);
            }

            // Run Python YOLO (this can throw) — wrap to convert into BaseException
            com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse anomaliesResponse;
            try {
                anomaliesResponse = PythonYOLO.runYOLO(imageBytes);
            } catch (RuntimeException ex) {
                // If the runner preserved a temp image, it encodes the path in the message
                String msg = ex.getMessage() == null ? "" : ex.getMessage();
                log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, msg, StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
                anomaliesResponse = new com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse(java.util.Collections.emptyList());
                // attempt to persist empty detectionJson
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    String detectionJson = mapper.writeValueAsString(anomaliesResponse.getAnomalies());
                    entity.setDetectionJson(detectionJson);
                    imageDataRepository.save(entity);
                } catch (Exception ex2) {
                    log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex2.getMessage(), StackTraceTracker.displayStackStraceArray(ex2.getStackTrace()));
                }

                // If the message contains the preserved file path, include it in responseDescription
                if (msg != null && msg.contains("FILE:")) {
                    int idx = msg.indexOf("FILE:") + 5;
                    int s2 = msg.indexOf(';', idx);
                    String filePath = (s2 == -1) ? msg.substring(idx) : msg.substring(idx, s2);
                    return new ApiResponse<>(ResponseCodeEnum.PARTIAL_SUCCESS.code(), "Detection failed; preserved image at: " + filePath, anomaliesResponse);
                }

                return new ApiResponse<>(ResponseCodeEnum.PARTIAL_SUCCESS.code(), "Detection ran but returned no anomalies (see logs).", anomaliesResponse);
            }

            // Persist detection JSON back to the entity
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String detectionJson = mapper.writeValueAsString(anomaliesResponse.getAnomalies());
                entity.setDetectionJson(detectionJson);
                imageDataRepository.save(entity);
            } catch (Exception ex) {
                log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
                // do not fail detection return — just log
            }

            // If there are no anomalies, return SUCCESS with a friendly description
            if (anomaliesResponse.getAnomalies() == null || anomaliesResponse.getAnomalies().isEmpty()) {
                return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), "No errors", anomaliesResponse);
            }

            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), anomaliesResponse);
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_DETECTED.code(), ResponseCodeEnum.IMAGE_NOT_DETECTED.message());
        }
    }
}
