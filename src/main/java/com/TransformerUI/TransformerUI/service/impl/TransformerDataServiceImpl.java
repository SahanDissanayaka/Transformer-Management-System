package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.entity.TransformerDataEntity;
import com.TransformerUI.TransformerUI.repository.TransformerDataRepository;
import com.TransformerUI.TransformerUI.service.TransformerDataService;
import com.TransformerUI.TransformerUI.service.util.StackTraceTracker;
import com.TransformerUI.TransformerUI.service.util.DataSpecificationUtil;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.FilterRequest;
import com.TransformerUI.TransformerUI.transport.request.TransformerDataRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.PageDetail;
import com.TransformerUI.TransformerUI.transport.response.ResponseCodeEnum;
import com.TransformerUI.TransformerUI.transport.response.TransformerDataResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class TransformerDataServiceImpl implements TransformerDataService {

    private final TransformerDataRepository transformerDataRepository;

    public TransformerDataServiceImpl(TransformerDataRepository transformerDataRepository) {
        this.transformerDataRepository = transformerDataRepository;
    }

    @Override
    public ApiResponse<Void> saveTransformerData(TransformerDataRequest transformerDataRequest) throws BaseException {
        long start = System.currentTimeMillis();
        try {
            validateTransformerData(transformerDataRequest);
            TransformerDataEntity transformerDataEntity =
                    CommonMapper.map(transformerDataRequest, TransformerDataEntity.class);
            transformerDataRepository.save(transformerDataEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE,
                    System.currentTimeMillis() - start,
                    ex.getMessage(),
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.TRANSFORMER_NOT_CREATED.code(),
                    ResponseCodeEnum.TRANSFORMER_NOT_CREATED.message());
        }
    }

    private void validateTransformerData(TransformerDataRequest transformerDataRequest) throws BaseException {
        if (transformerDataRequest.getRegion() == null
                || transformerDataRequest.getTransformerNo() == null
                || transformerDataRequest.getPoleNo() == null
                || transformerDataRequest.getType() == null
                || transformerDataRequest.getLocationDetails() == null) {
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Mandatory Fields are Missing");
        }
    }

    @Override
    public ApiResponse<Void> updateTransformerData(TransformerDataRequest transformerDataRequest) throws BaseException {
        long start = System.currentTimeMillis();
        try {
            TransformerDataEntity existingTransformerEntity = transformerDataRepository.findById(transformerDataRequest.getId())
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(),
                            "Transformer Data is not found with ID to Update: " + transformerDataRequest.getId()));
            CommonMapper.update(transformerDataRequest, existingTransformerEntity);

            transformerDataRepository.save(existingTransformerEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, System.currentTimeMillis() - start,
                    ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, System.currentTimeMillis() - start,
                    ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.TRANSFORMER_NOT_UPDATED.code(),
                    ResponseCodeEnum.TRANSFORMER_NOT_UPDATED.message());
        }
    }

    @Override
    public ApiResponse<TransformerDataResponse> getTransformerById(Long id) throws BaseException {
        long start = System.currentTimeMillis();
        try {
            TransformerDataEntity transformerDataEntity = transformerDataRepository.findById(id)
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(),
                            "Transformer not found with ID to View: " + id));
            TransformerDataResponse transformerDataResponse =
                    CommonMapper.map(transformerDataEntity, TransformerDataResponse.class);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), transformerDataResponse);
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, System.currentTimeMillis() - start,
                    ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, System.currentTimeMillis() - start,
                    ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.TRANSFORMER_NOT_CONNECTED.code(),
                    ResponseCodeEnum.TRANSFORMER_NOT_CONNECTED.message());
        }
    }

    @Override
    public ApiResponse<Void> deleteTransformerById(Long id) throws BaseException {
        long start = System.currentTimeMillis();
        try {
            TransformerDataEntity transformerDataEntity = transformerDataRepository.findById(id)
                    .orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(),
                            "Transformer is not found with ID to Delete: " + id));
            transformerDataRepository.delete(transformerDataEntity);

            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, System.currentTimeMillis() - start,
                    ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, System.currentTimeMillis() - start,
                    ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.TRANSFORMER_NOT_DELETED.code(),
                    ResponseCodeEnum.TRANSFORMER_NOT_DELETED.message());
        }
    }

    @Override
    public ApiResponse<List<TransformerDataResponse>> filterTransformerData(FilterRequest filterRequest) {
        ApiResponse<List<TransformerDataResponse>> response = new ApiResponse<>();
        try {
            int pageId = filterRequest.getOffset() != null ? filterRequest.getOffset() : 0;
            int limit = filterRequest.getLimit() != null ? filterRequest.getLimit() : 10;
            Pageable pageable = PageRequest.of(pageId, limit, Sort.by(Sort.Direction.DESC, "id"));

            Specification<TransformerDataEntity> spec = DataSpecificationUtil.buildSpecification(filterRequest);
            Page<TransformerDataEntity> results = transformerDataRepository.findAll(spec, pageable);

            List<TransformerDataResponse> responseList = results.stream()
                    .map(entity -> CommonMapper.map(entity, TransformerDataResponse.class))
                    .toList();

            response.setResponseCode("2000");
            response.setResponseDescription("Operation Successful");
            response.setResponseData(responseList);

            PageDetail pageDetail = new PageDetail();
            pageDetail.setTotalRecords(String.valueOf(results.getTotalElements()));
            pageDetail.setPageNumber(String.valueOf(results.getNumber() + 1));
            pageDetail.setPageElementCount(String.valueOf(results.getNumberOfElements()));
            response.setPageDetail(pageDetail);

            return response;
        } catch (Exception e) {
            log.error("Error occurred while filtering Transformer Data", e);
            return new ApiResponse<>(ResponseCodeEnum.INTERNAL_SERVER_ERROR.code(),
                    ResponseCodeEnum.INTERNAL_SERVER_ERROR.message(), null);        }
    }
}
