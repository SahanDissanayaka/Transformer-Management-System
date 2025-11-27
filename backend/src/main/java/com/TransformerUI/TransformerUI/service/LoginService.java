package com.TransformerUI.TransformerUI.service;

import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.LoginRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.LoginResponse;

public interface LoginService {
    ApiResponse<Void> saveLoginData(LoginRequest loginRequest) throws BaseException;
    ApiResponse<LoginResponse> verifyCredentials(LoginRequest loginRequest) throws BaseException;
}
