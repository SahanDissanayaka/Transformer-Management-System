package com.TransformerUI.TransformerUI.controller;

import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class BaseController {

    public <T> ResponseEntity<ApiResponse<T>> setResponseEntity(ApiResponse<T> commonAdaptorResp){
        String responseCode = commonAdaptorResp.getResponseCode();
        return switch (responseCode) {
            case "2000", "2001" -> ResponseEntity.status(HttpStatus.OK).body(commonAdaptorResp);
            case "2007" -> ResponseEntity.status(HttpStatus.MULTI_STATUS).body(commonAdaptorResp);
            case "4000", "4001" -> ResponseEntity.status(HttpStatus.BAD_REQUEST).body(commonAdaptorResp);
            case "4003" -> ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(commonAdaptorResp);
            default -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(commonAdaptorResp);
        };
    }
}
