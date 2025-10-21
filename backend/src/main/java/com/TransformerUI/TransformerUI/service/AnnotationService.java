package com.TransformerUI.TransformerUI.service;

import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;

import java.util.List;
import java.util.Map;

public interface AnnotationService {

    ApiResponse<Map<String, Object>> saveAnnotation(String transformerNo, String inspectionNo, Map<String, Object> annotationData) throws BaseException;

    ApiResponse<List<Map<String, Object>>> getAnnotations(String transformerNo, String inspectionNo) throws BaseException;

    ApiResponse<Map<String, Object>> updateAnnotation(Long id, Map<String, Object> annotationData) throws BaseException;

    ApiResponse<Void> deleteAnnotation(Long id) throws BaseException;
}
