package com.TransformerUI.TransformerUI.controller;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.service.TransformerDataService;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.FilterRequest;
import com.TransformerUI.TransformerUI.transport.request.TransformerDataRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.TransformerDataResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${base-url.context}"+"/transformer-data")
@Slf4j
public class TransformerDataController extends BaseController {
    private final TransformerDataService transformerDataService;

    public TransformerDataController(TransformerDataService transformerDataService) {
        this.transformerDataService = transformerDataService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Void>> createProbe(@RequestBody TransformerDataRequest transformerData, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED,request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = transformerDataService.saveTransformerData(transformerData);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<ApiResponse<TransformerDataResponse>> getProbeById(@PathVariable Long id, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED,request.getMethod(), request.getRequestURI());
        ApiResponse<TransformerDataResponse>  resp = transformerDataService.getTransformerById(id);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateProbe(
            @RequestBody TransformerDataRequest probeModel, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = transformerDataService.updateTransformerData(probeModel);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProbeById(@PathVariable Long id, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED,request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = transformerDataService.deleteTransformerById(id);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<TransformerDataResponse>>> filterProbeManagement(@RequestBody FilterRequest filterRequest, HttpServletRequest httpServletRequest) {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED, httpServletRequest.getMethod(), httpServletRequest.getRequestURI());
        ApiResponse<List<TransformerDataResponse>> commonAdaptorResp = transformerDataService.filterTransformerData(filterRequest);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, commonAdaptorResp.getResponseDescription());
        return ResponseEntity.status(HttpStatus.OK).body(commonAdaptorResp);
    }
}

