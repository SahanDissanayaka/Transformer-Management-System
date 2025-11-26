package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.entity.InspectionDataEntity;
import com.TransformerUI.TransformerUI.entity.LoginEntity;
import com.TransformerUI.TransformerUI.repository.LoginRepository;
import com.TransformerUI.TransformerUI.service.LoginService;
import com.TransformerUI.TransformerUI.service.util.StackTraceTracker;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.LoginRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.InspectionDataResponse;
import com.TransformerUI.TransformerUI.transport.response.LoginResponse;
import com.TransformerUI.TransformerUI.transport.response.ResponseCodeEnum;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Service
@Slf4j
public class LoginServiceImpl implements LoginService {

    private final LoginRepository loginRepository;

    public LoginServiceImpl(LoginRepository loginRepository) {
        this.loginRepository = loginRepository;
    }

    @Override
    public ApiResponse<Void> saveLoginData(LoginRequest loginRequest) throws BaseException {
        long start = System.currentTimeMillis();
        try {
            validateLoginData(loginRequest);
            LoginEntity loginEntity =
                    CommonMapper.map(loginRequest, LoginEntity.class);
            loginRepository.save(loginEntity);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message());
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE,
                    System.currentTimeMillis() - start,
                    ex.getMessage(),
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.USER_NOT_CREATED.code(),
                    ResponseCodeEnum.USER_NOT_CREATED.message());
        }
    }

    private void validateLoginData(LoginRequest loginRequest) throws BaseException {
        if (loginRequest.getUsername() == null
                || loginRequest.getPassword() == null) {
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Mandatory Fields are Missing");
        }
    }

    @Override
    public ApiResponse<LoginResponse> verifyCredentials(LoginRequest loginRequest) throws BaseException {
        long start = System.currentTimeMillis();
        try {
            validateLoginData(loginRequest);
            LoginEntity loginEntity = loginRepository.findByUsernameAndPassword(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            ).orElseThrow(() -> new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Invalid username or password"));

            LoginResponse loginResponse = CommonMapper.map(loginEntity, LoginResponse.class);
            return new ApiResponse<>(ResponseCodeEnum.SUCCESS.code(), ResponseCodeEnum.SUCCESS.message(), loginResponse);
        } catch (BaseException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error(LoggingAdviceConstants.EXCEPTION_STACK_TRACE,
                    System.currentTimeMillis() - start,
                    ex.getMessage(),
                    StackTraceTracker.displayStackStraceArray(ex.getStackTrace()));
            throw new BaseException(ResponseCodeEnum.BAD_REQUEST.code(), "Invalid username or password");
        }
    }
}
