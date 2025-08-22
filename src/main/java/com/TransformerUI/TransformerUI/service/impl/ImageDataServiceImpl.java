package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.entity.ImageDataEntity;
import com.TransformerUI.TransformerUI.repository.ImageDataRepository;
import com.TransformerUI.TransformerUI.service.ImageDataService;
import com.TransformerUI.TransformerUI.service.util.StackTraceTracker;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.ImageRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.ImageResponse;
import com.TransformerUI.TransformerUI.transport.response.ResponseCodeEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageDataServiceImpl implements ImageDataService {

    private final ImageDataRepository imageDataRepository;
    private final CustomMapper customMapper;

    @Override
    public ApiResponse<Void> saveImage(ImageRequest imageRequest) throws BaseException {
        try {
            validateImageRequest(imageRequest);
            ImageDataEntity imageDataEntity = customMapper.toEntity(imageRequest);
            imageDataRepository.save(imageDataEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), null);
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(),
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_CREATED.code(), ResponseCodeEnum.IMAGE_NOT_CREATED.message());
        }
    }

    private void validateImageRequest(ImageRequest imageRequest) throws BaseException {
        if (imageRequest.getTransformerNo() == null
                || imageRequest.getInspectionNo() == null
                || imageRequest.getType() == null
                || imageRequest.getPhoto() == null || imageRequest.getPhoto().isEmpty()) {
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(),
                    "Mandatory fields are missing for Image");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ImageResponse> getImage(String transformerNo, String inspectionNo) throws BaseException {
        try {
            Optional<ImageDataEntity> entityOpt = imageDataRepository.findByTransformerNoAndInspectionNo(transformerNo, inspectionNo);
            if (entityOpt.isEmpty()) {
                throw new BaseException("Image not found for Transformer: " + transformerNo + ", Inspection: " + inspectionNo);
            }
            ImageDataEntity imageDataEntity = entityOpt.get();
            ImageResponse response = customMapper.toResponse(imageDataEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), response);
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(),
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_CONNECTED.code(), ResponseCodeEnum.IMAGE_NOT_CONNECTED.message());
        }
    }

    @Override
    public ApiResponse<Void> updateImage(String transformerNo, String inspectionNo, ImageRequest imageRequest) throws BaseException {
        try {
            Optional<ImageDataEntity> entityOpt = imageDataRepository.findByTransformerNoAndInspectionNo(transformerNo, inspectionNo);
            if (entityOpt.isEmpty()) {
                throw new BaseException("Image not found for Transformer: " + transformerNo + ", Inspection: " + inspectionNo);
            }
            ImageDataEntity entity = entityOpt.get();
            customMapper.updateEntity(entity, imageRequest);
            imageDataRepository.save(entity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), null);
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_UPDATED.code(), ResponseCodeEnum.IMAGE_NOT_UPDATED.message());
        }
    }

    @Override
    public ApiResponse<Void> deleteImage(String transformerNo, String inspectionNo) throws BaseException {
        try {
            if (!imageDataRepository.existsByTransformerNoAndInspectionNo(transformerNo, inspectionNo)) {
                throw new BaseException("Image not found for Transformer: " + transformerNo + ", Inspection: " + inspectionNo);
            }
            imageDataRepository.deleteByTransformerNoAndInspectionNo(transformerNo, inspectionNo);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), null);
        } catch (BaseException ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE, ex.getMessage(), StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.IMAGE_NOT_DELETED.code(), ResponseCodeEnum.IMAGE_NOT_DELETED.message());
        }
    }
}
