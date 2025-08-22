package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.entity.InspectionDataEntity;
import com.TransformerUI.TransformerUI.repository.InspectionDataRepository;
import com.TransformerUI.TransformerUI.service.InspectionDataService;
import com.TransformerUI.TransformerUI.service.util.DataSpecificationUtil;
import com.TransformerUI.TransformerUI.service.util.StackTraceTracker;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.FilterRequest;
import com.TransformerUI.TransformerUI.transport.request.InspectionDataRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.PageDetail;
import com.TransformerUI.TransformerUI.transport.response.ResponseCodeEnum;
import com.TransformerUI.TransformerUI.transport.response.InspectionDataResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class InspectionDataServiceImpl implements InspectionDataService {

    private final InspectionDataRepository inspectionDataRepository;
    private final CustomMapper customMapper;

    public InspectionDataServiceImpl(InspectionDataRepository inspectionDataRepository, CustomMapper customMapper) {
        this.inspectionDataRepository = inspectionDataRepository;
        this.customMapper = customMapper;
    }

    @Override
    public ApiResponse<Void> saveInspectionData(InspectionDataRequest inspectionDataRequest) throws BaseException {
        try {
            validateInspectionData(inspectionDataRequest);
            InspectionDataEntity inspectionDataEntity = customMapper.toEntity(inspectionDataRequest);
            inspectionDataRepository.save(inspectionDataEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_CREATED.code(), ResponseCodeEnum.INSPECTION_NOT_CREATED.message());
        }
    }

    private void validateInspectionData(InspectionDataRequest inspectionDataRequest) throws BaseException {
        if (inspectionDataRequest.getBranch() == null
                || inspectionDataRequest.getTransformerNo() == null
                || inspectionDataRequest.getInspectionDate() == null
                || inspectionDataRequest.getTime() == null) {
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Mandatory Fields are Missing for Inspection");
        }
    }

    @Override
    public ApiResponse<Void> updateInspectionData(InspectionDataRequest inspectionDataRequest) throws BaseException {
        try {
            InspectionDataEntity existingInspectionEntity = inspectionDataRepository.findById(inspectionDataRequest.getId())
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Inspection Data not found with ID: " + inspectionDataRequest.getId()));

            customMapper.updateEntity(existingInspectionEntity, inspectionDataRequest);
            inspectionDataRepository.save(existingInspectionEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_UPDATED.code(), ResponseCodeEnum.INSPECTION_NOT_UPDATED.message());
        }
    }

    @Override
    public ApiResponse<InspectionDataResponse> getInspectionById(Long id) throws BaseException {
        try {
            InspectionDataEntity inspectionDataEntity = inspectionDataRepository.findById(id)
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Inspection not found with ID: " + id));
            InspectionDataResponse inspectionDataResponse = CommonMapper.map(inspectionDataEntity, InspectionDataResponse.class);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), inspectionDataResponse);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_CONNECTED.code(), ResponseCodeEnum.INSPECTION_NOT_CONNECTED.message());
        }
    }

    @Override
    public ApiResponse<Void> deleteInspectionById(Long id) throws BaseException {
        try {
            InspectionDataEntity inspectionDataEntity = inspectionDataRepository.findById(id)
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Inspection not found with ID: " + id));
            inspectionDataRepository.delete(inspectionDataEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.INSPECTION_NOT_DELETED.code(), ResponseCodeEnum.INSPECTION_NOT_DELETED.message());
        }
    }

    @Override
    public ApiResponse<List<InspectionDataResponse>> filterInspectionData(FilterRequest filterRequest) {
        try {
            int pageId = filterRequest.getOffset() != null ? filterRequest.getOffset() : 0;
            int limit = filterRequest.getLimit() != null ? filterRequest.getLimit() : 10;
            Pageable pageable = PageRequest.of(pageId, limit, Sort.by(Sort.Direction.DESC, "id"));

            Specification<InspectionDataEntity> spec = DataSpecificationUtil.buildSpecification(filterRequest);
            Page<InspectionDataEntity> pageResult = inspectionDataRepository.findAll(spec, pageable);

            List<InspectionDataResponse> inspectionResponses = pageResult.stream()
                    .map(entity -> CommonMapper.map(entity, InspectionDataResponse.class))
                    .toList();

            ApiResponse<List<InspectionDataResponse>> response = new ApiResponse<>(
                    ResponseCodeEnum.SUCCESS.code(),
                    ResponseCodeEnum.SUCCESS.message(),
                    inspectionResponses
            );

            PageDetail pageDetail = new PageDetail();
            pageDetail.setTotalRecords(String.valueOf(pageResult.getTotalElements()));
            pageDetail.setPageNumber(String.valueOf(pageResult.getNumber() + 1));
            pageDetail.setPageElementCount(String.valueOf(pageResult.getNumberOfElements()));
            response.setPageDetail(pageDetail);

            return response;
        } catch (Exception e) {
            log.error("Error occurred while filtering Inspection Data", e);
            return new ApiResponse<>(ResponseCodeEnum.INTERNAL_SERVER_ERROR.code(),
                    ResponseCodeEnum.INTERNAL_SERVER_ERROR.message(), null);
        }
    }
}
