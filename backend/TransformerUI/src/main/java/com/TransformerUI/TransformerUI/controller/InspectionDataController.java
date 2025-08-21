package com.TransformerUI.TransformerUI.controller;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.service.InspectionDataService;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.FilterRequest;
import com.TransformerUI.TransformerUI.transport.request.InspectionDataRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.InspectionDataResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${base-url.context}" + "/inspection-data")
@Slf4j
public class InspectionDataController extends BaseController {

    private final InspectionDataService inspectionDataService;

    public InspectionDataController(InspectionDataService inspectionDataService) {
        this.inspectionDataService = inspectionDataService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Void>> createInspection(
            @RequestBody InspectionDataRequest inspectionData, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = inspectionDataService.saveInspectionData(inspectionData);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<ApiResponse<InspectionDataResponse>> getInspectionById(
            @PathVariable Long id, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<InspectionDataResponse> resp = inspectionDataService.getInspectionById(id);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateInspection(
            @RequestBody InspectionDataRequest inspectionData, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = inspectionDataService.updateInspectionData(inspectionData);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInspectionById( @PathVariable Long id, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = inspectionDataService.deleteInspectionById(id);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<InspectionDataResponse>>> filterInspections(
            @RequestBody FilterRequest filterRequest, HttpServletRequest httpServletRequest) {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, httpServletRequest.getMethod(), httpServletRequest.getRequestURI());
        ApiResponse<List<InspectionDataResponse>> resp = inspectionDataService.filterInspectionData(filterRequest);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return ResponseEntity.status(HttpStatus.OK).body(resp);
    }
}
