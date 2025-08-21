package com.TransformerUI.TransformerUI.service;

import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.FilterRequest;
import com.TransformerUI.TransformerUI.transport.request.InspectionDataRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.InspectionDataResponse;

import java.util.List;

public interface InspectionDataService {

    ApiResponse<Void> saveInspectionData(InspectionDataRequest inspectionDataRequest) throws BaseException;
    ApiResponse<Void> updateInspectionData(InspectionDataRequest inspectionDataRequest) throws BaseException;
    ApiResponse<InspectionDataResponse> getInspectionById(Long id) throws BaseException;
    ApiResponse<Void> deleteInspectionById(Long id) throws BaseException;
    ApiResponse<List<InspectionDataResponse>> filterInspectionData(FilterRequest filterRequest);
}
