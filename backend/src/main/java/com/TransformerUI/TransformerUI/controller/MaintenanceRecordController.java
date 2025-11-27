package com.TransformerUI.TransformerUI.controller;

import com.TransformerUI.TransformerUI.service.MaintenanceRecordService;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.MaintenanceRecordRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.MaintenanceRecordResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/maintenanceRecord")
public class MaintenanceRecordController {

    private final MaintenanceRecordService maintenanceRecordService;

    public MaintenanceRecordController(MaintenanceRecordService maintenanceRecordService) {
        this.maintenanceRecordService = maintenanceRecordService;
    }

    @PostMapping("/save")
    public ResponseEntity<ApiResponse<Void>> saveMaintenanceRecord(@RequestBody MaintenanceRecordRequest request) {
        try {
            ApiResponse<Void> response = maintenanceRecordService.saveMaintenanceRecord(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (BaseException ex) {
            log.error("Error saving maintenance record", ex);
            return new ResponseEntity<>(new ApiResponse<>(ex.getResponseCode(), ex.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateMaintenanceRecord(@RequestBody MaintenanceRecordRequest request) {
        try {
            ApiResponse<Void> response = maintenanceRecordService.updateMaintenanceRecord(request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (BaseException ex) {
            log.error("Error updating maintenance record", ex);
            return new ResponseEntity<>(new ApiResponse<>(ex.getResponseCode(), ex.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceRecordResponse>> getMaintenanceRecordById(@PathVariable Long id) {
        try {
            ApiResponse<MaintenanceRecordResponse> response = maintenanceRecordService.getMaintenanceRecordById(id);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (BaseException ex) {
            log.error("Error fetching maintenance record", ex);
            return new ResponseEntity<>(new ApiResponse<>(ex.getResponseCode(), ex.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/inspection/{inspectionId}")
    public ResponseEntity<ApiResponse<List<MaintenanceRecordResponse>>> getMaintenanceRecordsByInspectionId(
            @PathVariable Long inspectionId) {
        try {
            ApiResponse<List<MaintenanceRecordResponse>> response = 
                    maintenanceRecordService.getMaintenanceRecordsByInspectionId(inspectionId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (BaseException ex) {
            log.error("Error fetching maintenance records", ex);
            return new ResponseEntity<>(new ApiResponse<>(ex.getResponseCode(), ex.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMaintenanceRecord(@PathVariable Long id) {
        try {
            ApiResponse<Void> response = maintenanceRecordService.deleteMaintenanceRecord(id);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (BaseException ex) {
            log.error("Error deleting maintenance record", ex);
            return new ResponseEntity<>(new ApiResponse<>(ex.getResponseCode(), ex.getMessage()),
                    HttpStatus.BAD_REQUEST);
        }
    }
}
