package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.entity.AnnotationEntity;
import com.TransformerUI.TransformerUI.repository.AnnotationRepository;
import com.TransformerUI.TransformerUI.service.AnnotationService;
import com.TransformerUI.TransformerUI.service.util.StackTraceTracker;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.ResponseCodeEnum;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnnotationServiceImpl implements AnnotationService {

    private final AnnotationRepository annotationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public ApiResponse<Map<String, Object>> saveAnnotation(String transformerNo, String inspectionNo, Map<String, Object> annotationData) throws BaseException {
        try {
            AnnotationEntity entity = new AnnotationEntity();
            entity.setTransformerNo(transformerNo);
            entity.setInspectionNo(inspectionNo);
            
            // Extract and set fields from the map
            entity.setBbox(objectMapper.writeValueAsString(annotationData.get("bbox")));
            if (annotationData.containsKey("polygon") && annotationData.get("polygon") != null) {
                entity.setPolygon(objectMapper.writeValueAsString(annotationData.get("polygon")));
            }
            entity.setShape(annotationData.getOrDefault("shape", "bbox").toString());
            entity.setClassName(annotationData.get("className").toString());
            
            if (annotationData.containsKey("confidence") && annotationData.get("confidence") != null) {
                entity.setConfidence(Double.valueOf(annotationData.get("confidence").toString()));
            }
            
            entity.setAnnotationType(annotationData.getOrDefault("annotationType", "MANUAL_ADDED").toString());
            entity.setStatus(annotationData.getOrDefault("status", "pending").toString());
            
            if (annotationData.containsKey("comment")) {
                entity.setComment(annotationData.get("comment").toString());
            }
            if (annotationData.containsKey("userId")) {
                entity.setUserId(annotationData.get("userId").toString());
            }

            AnnotationEntity saved = annotationRepository.save(entity);
            Map<String, Object> response = entityToMap(saved);
            
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), response);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Failed to save annotation: " + ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<Map<String, Object>>> getAnnotations(String transformerNo, String inspectionNo) throws BaseException {
        try {
            List<AnnotationEntity> entities = annotationRepository.findByTransformerNoAndInspectionNo(transformerNo, inspectionNo);
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (AnnotationEntity entity : entities) {
                response.add(entityToMap(entity));
            }
            
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), response);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.NOT_FOUND.code(), "Failed to retrieve annotations");
        }
    }

    @Override
    @Transactional
    public ApiResponse<Map<String, Object>> updateAnnotation(Long id, Map<String, Object> annotationData) throws BaseException {
        try {
            AnnotationEntity entity = annotationRepository.findById(id)
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.NOT_FOUND.code(), "Annotation not found"));

            // Update fields
            if (annotationData.containsKey("bbox")) {
                entity.setBbox(objectMapper.writeValueAsString(annotationData.get("bbox")));
            }
            if (annotationData.containsKey("polygon") && annotationData.get("polygon") != null) {
                entity.setPolygon(objectMapper.writeValueAsString(annotationData.get("polygon")));
            }
            if (annotationData.containsKey("shape")) {
                entity.setShape(annotationData.get("shape").toString());
            }
            if (annotationData.containsKey("className")) {
                entity.setClassName(annotationData.get("className").toString());
            }
            if (annotationData.containsKey("confidence") && annotationData.get("confidence") != null) {
                entity.setConfidence(Double.valueOf(annotationData.get("confidence").toString()));
            }
            if (annotationData.containsKey("annotationType")) {
                entity.setAnnotationType(annotationData.get("annotationType").toString());
            }
            if (annotationData.containsKey("status")) {
                entity.setStatus(annotationData.get("status").toString());
            }
            if (annotationData.containsKey("comment")) {
                entity.setComment(annotationData.get("comment").toString());
            }

            AnnotationEntity updated = annotationRepository.save(entity);
            Map<String, Object> response = entityToMap(updated);
            
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), response);
        } catch (BaseException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Failed to update annotation: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteAnnotation(Long id) throws BaseException {
        try {
            if (!annotationRepository.existsById(id)) {
                throw new BaseException(ResponseCodeEnum.NOT_FOUND.code(), "Annotation not found");
            }
            annotationRepository.deleteById(id);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), null);
        } catch (BaseException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Failed to delete annotation");
        }
    }

    private Map<String, Object> entityToMap(AnnotationEntity entity) throws Exception {
        Map<String, Object> map = new HashMap<>();
        map.put("id", entity.getId());
        map.put("transformerNo", entity.getTransformerNo());
        map.put("inspectionNo", entity.getInspectionNo());
        map.put("bbox", objectMapper.readValue(entity.getBbox(), List.class));
        if (entity.getPolygon() != null) {
            map.put("polygon", objectMapper.readValue(entity.getPolygon(), List.class));
        }
        map.put("shape", entity.getShape());
        map.put("className", entity.getClassName());
        map.put("confidence", entity.getConfidence());
        map.put("annotationType", entity.getAnnotationType());
        map.put("status", entity.getStatus());
        map.put("comment", entity.getComment());
        map.put("userId", entity.getUserId());
        map.put("createdAt", entity.getCreatedAt());
        map.put("updatedAt", entity.getUpdatedAt());
        return map;
    }
}
