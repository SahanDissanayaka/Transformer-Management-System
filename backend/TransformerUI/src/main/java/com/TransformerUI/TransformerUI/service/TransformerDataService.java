package com.TransformerUI.TransformerUI.service;

import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.FilterRequest;
import com.TransformerUI.TransformerUI.transport.request.TransformerDataRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.TransformerDataResponse;

import java.util.List;

public interface TransformerDataService {

    ApiResponse<Void> saveTransformerData(TransformerDataRequest transformerDataRequest) throws BaseException;
    ApiResponse<Void> updateTransformerData(TransformerDataRequest transformerDataRequest) throws BaseException;
    ApiResponse<TransformerDataResponse> getTransformerById(Long id) throws BaseException;
    ApiResponse<Void> deleteTransformerById(Long id) throws BaseException;
    ApiResponse<List<TransformerDataResponse>> filterTransformerData(FilterRequest filterRequest);
}
