package com.TransformerUI.TransformerUI.service;

import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.ImageRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.ImageResponse;

public interface ImageDataService {

    ApiResponse<Void> saveImage(ImageRequest imageRequest) throws BaseException;
    ApiResponse<ImageResponse> getImage(String transformerNo, String inspectionNo, String type) throws BaseException;
    ApiResponse<Void> updateImage(String transformerNo, String inspectionNo, ImageRequest imageRequest) throws BaseException;
    ApiResponse<Void> deleteImage(String transformerNo, String inspectionNo) throws BaseException;
    
    // Run/refresh anomaly detection for an existing thermal image and return anomalies
    ApiResponse<com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse> detectAnomalies(String transformerNo, String inspectionNo) throws BaseException;
}
