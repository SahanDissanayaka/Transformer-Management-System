package com.TransformerUI.TransformerUI.controller;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.service.AnnotationService;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/transformers/{transformerNo}/inspections/{inspectionNo}/annotations")
public class AnnotationController extends BaseController {

    private final AnnotationService annotationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> saveAnnotation(
            @PathVariable String transformerNo,
            @PathVariable String inspectionNo,
            @RequestBody Map<String, Object> annotationData,
            HttpServletRequest httpServletRequest) throws BaseException {
        
        log.info(LoggingAdviceConstants.REQUEST_INITIATED_LOG, 0, "POST", httpServletRequest.getRequestURI());
        long startTime = System.currentTimeMillis();

        try {
            ApiResponse<Map<String, Object>> response = annotationService.saveAnnotation(transformerNo, inspectionNo, annotationData);
            log.info(LoggingAdviceConstants.REQUEST_TERMINATED_LOG, 
                    (System.currentTimeMillis() - startTime), 
                    response.getResponseDescription());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.REQUEST_TERMINATED_LOG, 
                    (System.currentTimeMillis() - startTime), 
                    "Error: " + ex.getMessage());
            throw ex;
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAnnotations(
            @PathVariable String transformerNo,
            @PathVariable String inspectionNo,
            HttpServletRequest httpServletRequest) throws BaseException {
        
        log.info(LoggingAdviceConstants.REQUEST_INITIATED_LOG, 0, "GET", httpServletRequest.getRequestURI());
        long startTime = System.currentTimeMillis();

        try {
            ApiResponse<List<Map<String, Object>>> response = annotationService.getAnnotations(transformerNo, inspectionNo);
            log.info(LoggingAdviceConstants.REQUEST_TERMINATED_LOG, 
                    (System.currentTimeMillis() - startTime), 
                    response.getResponseDescription());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.REQUEST_TERMINATED_LOG, 
                    (System.currentTimeMillis() - startTime), 
                    "Error: " + ex.getMessage());
            throw ex;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateAnnotation(
            @PathVariable String transformerNo,
            @PathVariable String inspectionNo,
            @PathVariable Long id,
            @RequestBody Map<String, Object> annotationData,
            HttpServletRequest httpServletRequest) throws BaseException {
        
        log.info(LoggingAdviceConstants.REQUEST_INITIATED_LOG, 0, "PUT", httpServletRequest.getRequestURI());
        long startTime = System.currentTimeMillis();

        try {
            ApiResponse<Map<String, Object>> response = annotationService.updateAnnotation(id, annotationData);
            log.info(LoggingAdviceConstants.REQUEST_TERMINATED_LOG, 
                    (System.currentTimeMillis() - startTime), 
                    response.getResponseDescription());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.REQUEST_TERMINATED_LOG, 
                    (System.currentTimeMillis() - startTime), 
                    "Error: " + ex.getMessage());
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnnotation(
            @PathVariable String transformerNo,
            @PathVariable String inspectionNo,
            @PathVariable Long id,
            HttpServletRequest httpServletRequest) throws BaseException {
        
        log.info(LoggingAdviceConstants.REQUEST_INITIATED_LOG, 0, "DELETE", httpServletRequest.getRequestURI());
        long startTime = System.currentTimeMillis();

        try {
            ApiResponse<Void> response = annotationService.deleteAnnotation(id);
            log.info(LoggingAdviceConstants.REQUEST_TERMINATED_LOG, 
                    (System.currentTimeMillis() - startTime), 
                    response.getResponseDescription());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.REQUEST_TERMINATED_LOG, 
                    (System.currentTimeMillis() - startTime), 
                    "Error: " + ex.getMessage());
            throw ex;
        }
    }
}
