package com.TransformerUI.TransformerUI.service;

import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.MaintenanceRecordRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.MaintenanceRecordResponse;

import java.util.List;

public interface MaintenanceRecordService {
    ApiResponse<Void> saveMaintenanceRecord(MaintenanceRecordRequest request) throws BaseException;
    ApiResponse<Void> updateMaintenanceRecord(MaintenanceRecordRequest request) throws BaseException;
    ApiResponse<MaintenanceRecordResponse> getMaintenanceRecordById(Long id) throws BaseException;
    ApiResponse<List<MaintenanceRecordResponse>> getMaintenanceRecordsByInspectionId(Long inspectionId) throws BaseException;
    ApiResponse<Void> deleteMaintenanceRecord(Long id) throws BaseException;
}
