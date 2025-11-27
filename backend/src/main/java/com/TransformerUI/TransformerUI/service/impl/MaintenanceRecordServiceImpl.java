package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.entity.InspectionDataEntity;
import com.TransformerUI.TransformerUI.entity.MaintenanceRecordEntity;
import com.TransformerUI.TransformerUI.repository.InspectionDataRepository;
import com.TransformerUI.TransformerUI.repository.MaintenanceRecordRepository;
import com.TransformerUI.TransformerUI.service.MaintenanceRecordService;
import com.TransformerUI.TransformerUI.service.util.StackTraceTracker;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.MaintenanceRecordRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.MaintenanceRecordResponse;
import com.TransformerUI.TransformerUI.transport.response.ResponseCodeEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MaintenanceRecordServiceImpl implements MaintenanceRecordService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final InspectionDataRepository inspectionDataRepository;

    public MaintenanceRecordServiceImpl(MaintenanceRecordRepository maintenanceRecordRepository,
                                      InspectionDataRepository inspectionDataRepository) {
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.inspectionDataRepository = inspectionDataRepository;
    }

    @Override
    public ApiResponse<Void> saveMaintenanceRecord(MaintenanceRecordRequest request) throws BaseException {
        try {
            // Validate inspection exists
            InspectionDataEntity inspection = inspectionDataRepository.findById(request.getInspectionId())
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), 
                            "Inspection not found with ID: " + request.getInspectionId()));

            MaintenanceRecordEntity entity = new MaintenanceRecordEntity();
            entity.setInspection(inspection);
            mapRequestToEntity(request, entity);
            
            maintenanceRecordRepository.save(entity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), 
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_CREATED.code(), 
                    "Failed to save maintenance record");
        }
    }

    @Override
    public ApiResponse<Void> updateMaintenanceRecord(MaintenanceRecordRequest request) throws BaseException {
        try {
            MaintenanceRecordEntity entity = maintenanceRecordRepository.findById(request.getId())
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), 
                            "Maintenance record not found with ID: " + request.getId()));

            mapRequestToEntity(request, entity);
            entity.setUpdatedAt(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            
            maintenanceRecordRepository.save(entity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), 
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_UPDATED.code(), 
                    "Failed to update maintenance record");
        }
    }

    @Override
    public ApiResponse<MaintenanceRecordResponse> getMaintenanceRecordById(Long id) throws BaseException {
        try {
            MaintenanceRecordEntity entity = maintenanceRecordRepository.findById(id)
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), 
                            "Maintenance record not found with ID: " + id));

            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), 
                    mapEntityToResponse(entity));
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), 
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_CONNECTED.code(), 
                    "Failed to fetch maintenance record");
        }
    }

    @Override
    public ApiResponse<List<MaintenanceRecordResponse>> getMaintenanceRecordsByInspectionId(Long inspectionId) throws BaseException {
        try {
            List<MaintenanceRecordEntity> records = maintenanceRecordRepository.findByInspectionId(inspectionId);
            List<MaintenanceRecordResponse> responses = records.stream()
                    .map(this::mapEntityToResponse)
                    .collect(Collectors.toList());

            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), responses);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), 
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_CONNECTED.code(), 
                    "Failed to fetch maintenance records");
        }
    }

    @Override
    public ApiResponse<Void> deleteMaintenanceRecord(Long id) throws BaseException {
        try {
            MaintenanceRecordEntity entity = maintenanceRecordRepository.findById(id)
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), 
                            "Maintenance record not found with ID: " + id));

            maintenanceRecordRepository.delete(entity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), 
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_DELETED.code(), 
                    "Failed to delete maintenance record");
        }
    }

    private void mapRequestToEntity(MaintenanceRecordRequest request, MaintenanceRecordEntity entity) {
        if (request.getPoleNo() != null) entity.setPoleNo(request.getPoleNo());
        if (request.getLocationDetails() != null) entity.setLocationDetails(request.getLocationDetails());
        if (request.getType() != null) entity.setType(request.getType());
        if (request.getInspected() != null) entity.setInspected(request.getInspected());
        if (request.getIrLeft() != null) entity.setIrLeft(request.getIrLeft());
        if (request.getIrRight() != null) entity.setIrRight(request.getIrRight());
        if (request.getIrFront() != null) entity.setIrFront(request.getIrFront());
        if (request.getLastMonthKva() != null) entity.setLastMonthKva(request.getLastMonthKva());
        if (request.getLastMonthDate() != null) entity.setLastMonthDate(request.getLastMonthDate());
        if (request.getLastMonthTime() != null) entity.setLastMonthTime(request.getLastMonthTime());
        if (request.getCurrentMonthKva() != null) entity.setCurrentMonthKva(request.getCurrentMonthKva());
        if (request.getSerial() != null) entity.setSerial(request.getSerial());
        if (request.getMeterCtRatio() != null) entity.setMeterCtRatio(request.getMeterCtRatio());
        if (request.getMake() != null) entity.setMake(request.getMake());
        if (request.getStartTime() != null) entity.setStartTime(request.getStartTime());
        if (request.getCompletionTime() != null) entity.setCompletionTime(request.getCompletionTime());
        if (request.getSupervisedBy() != null) entity.setSupervisedBy(request.getSupervisedBy());
        if (request.getTechI() != null) entity.setTechI(request.getTechI());
        if (request.getTechII() != null) entity.setTechII(request.getTechII());
        if (request.getTechIII() != null) entity.setTechIII(request.getTechIII());
        if (request.getHelpers() != null) entity.setHelpers(request.getHelpers());
        if (request.getInspectedBy() != null) entity.setInspectedBy(request.getInspectedBy());
        if (request.getInspectedByDate() != null) entity.setInspectedByDate(request.getInspectedByDate());
        if (request.getReflectedBy() != null) entity.setReflectedBy(request.getReflectedBy());
        if (request.getReflectedByDate() != null) entity.setReflectedByDate(request.getReflectedByDate());
        if (request.getReInspectedBy() != null) entity.setReInspectedBy(request.getReInspectedBy());
        if (request.getReInspectedByDate() != null) entity.setReInspectedByDate(request.getReInspectedByDate());
        if (request.getCss() != null) entity.setCss(request.getCss());
        if (request.getCssDate() != null) entity.setCssDate(request.getCssDate());
    }

    private MaintenanceRecordResponse mapEntityToResponse(MaintenanceRecordEntity entity) {
        MaintenanceRecordResponse response = new MaintenanceRecordResponse();
        response.setId(entity.getId());
        response.setInspectionId(entity.getInspection().getId());
        response.setPoleNo(entity.getPoleNo());
        response.setLocationDetails(entity.getLocationDetails());
        response.setType(entity.getType());
        response.setInspected(entity.getInspected());
        response.setIrLeft(entity.getIrLeft());
        response.setIrRight(entity.getIrRight());
        response.setIrFront(entity.getIrFront());
        response.setLastMonthKva(entity.getLastMonthKva());
        response.setLastMonthDate(entity.getLastMonthDate());
        response.setLastMonthTime(entity.getLastMonthTime());
        response.setCurrentMonthKva(entity.getCurrentMonthKva());
        response.setSerial(entity.getSerial());
        response.setMeterCtRatio(entity.getMeterCtRatio());
        response.setMake(entity.getMake());
        response.setStartTime(entity.getStartTime());
        response.setCompletionTime(entity.getCompletionTime());
        response.setSupervisedBy(entity.getSupervisedBy());
        response.setTechI(entity.getTechI());
        response.setTechII(entity.getTechII());
        response.setTechIII(entity.getTechIII());
        response.setHelpers(entity.getHelpers());
        response.setInspectedBy(entity.getInspectedBy());
        response.setInspectedByDate(entity.getInspectedByDate());
        response.setReflectedBy(entity.getReflectedBy());
        response.setReflectedByDate(entity.getReflectedByDate());
        response.setReInspectedBy(entity.getReInspectedBy());
        response.setReInspectedByDate(entity.getReInspectedByDate());
        response.setCss(entity.getCss());
        response.setCssDate(entity.getCssDate());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}
