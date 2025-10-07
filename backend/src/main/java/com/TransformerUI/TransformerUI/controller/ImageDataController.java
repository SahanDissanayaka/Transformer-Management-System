package com.TransformerUI.TransformerUI.controller;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.service.ImageDataService;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.ImageRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.ImageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${base-url.context}" + "/image-data")
@Slf4j
public class ImageDataController extends BaseController {

    private final ImageDataService imageDataService;

    public ImageDataController(ImageDataService imageDataService) {
        this.imageDataService = imageDataService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ImageResponse>> uploadImage(@ModelAttribute ImageRequest imageRequest, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        // Save the image (do not run detector in mapper)
        ApiResponse<Void> saveResp = imageDataService.saveImage(imageRequest);
        // After saving, attempt detection (best-effort). If detection fails partially, we'll return the saved image but include the detection message.
        String detectionMsg = null;
        String detectionCode = null;
        try {
            ApiResponse<com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse> det = imageDataService.detectAnomalies(imageRequest.getTransformerNo(), imageRequest.getInspectionNo());
            detectionCode = det.getResponseCode();
            detectionMsg = det.getResponseDescription();
            if (!"2000".equals(det.getResponseCode()) && det.getResponseDescription() != null) {
                log.warn("Detection returned non-success for {}/{}: {}", imageRequest.getTransformerNo(), imageRequest.getInspectionNo(), det.getResponseDescription());
            }
        } catch (Exception ex) {
            log.warn("Detection attempt failed after upload: {}", ex.getMessage());
            detectionMsg = "Detection attempt failed: " + ex.getMessage();
            detectionCode = "2007";
        }

        // After saving (and attempting detection), fetch the stored image response (includes anomalies/photo)
        ApiResponse<ImageResponse> resp = imageDataService.getImage(imageRequest.getTransformerNo(), imageRequest.getInspectionNo(), imageRequest.getType());
        // If detection returned a non-success code or a message, include it in the responseDescription
        if (detectionMsg != null && !detectionMsg.isBlank()) {
            String combined = resp.getResponseDescription() == null ? "" : resp.getResponseDescription() + " | ";
            combined += "Detection: (" + (detectionCode == null ? "" : detectionCode) + ") " + detectionMsg;
            resp.setResponseDescription(combined);
        }
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @GetMapping("/view")
    public ResponseEntity<ApiResponse<ImageResponse>> getImage(@RequestParam String transformerNo, @RequestParam String inspectionNo, @RequestParam String type, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<ImageResponse> resp = imageDataService.getImage(transformerNo, inspectionNo, type);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @PostMapping("/detect")
    public ResponseEntity<ApiResponse<com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse>> detectImage(@RequestParam String transformerNo, @RequestParam String inspectionNo, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse> resp = imageDataService.detectAnomalies(transformerNo, inspectionNo);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateImage(@RequestParam String transformerNo, @RequestParam String inspectionNo, @ModelAttribute ImageRequest imageRequest, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = imageDataService.updateImage(transformerNo, inspectionNo, imageRequest);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@RequestParam String transformerNo, @RequestParam String inspectionNo, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = imageDataService.deleteImage(transformerNo, inspectionNo);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }
}
