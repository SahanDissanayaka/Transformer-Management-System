package com.TransformerUI.TransformerUI.controller;

import com.TransformerUI.TransformerUI.constant.LoggingAdviceConstants;
import com.TransformerUI.TransformerUI.service.LoginService;
import com.TransformerUI.TransformerUI.service.impl.LoginServiceImpl;
import com.TransformerUI.TransformerUI.service.util.exception.type.BaseException;
import com.TransformerUI.TransformerUI.transport.request.LoginRequest;
import com.TransformerUI.TransformerUI.transport.request.TransformerDataRequest;
import com.TransformerUI.TransformerUI.transport.response.ApiResponse;
import com.TransformerUI.TransformerUI.transport.response.LoginResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@Slf4j
public class LoginController extends BaseController{

    private final LoginService loginService;
    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/save")
    public ResponseEntity<ApiResponse<Void>> createUser(@RequestBody LoginRequest loginRequest, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED,request.getMethod(), request.getRequestURI());
        ApiResponse<Void> resp = loginService.saveLoginData(loginRequest);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<ApiResponse<LoginResponse>> getUserById(@PathVariable Long id, HttpServletRequest request) throws BaseException {
        long startTime = System.currentTimeMillis();
        log.info(LoggingAdviceConstants.REQUEST_INITIATED,request.getMethod(), request.getRequestURI());
        ApiResponse<LoginResponse>  resp = loginService.getUserById(id);
        log.info(LoggingAdviceConstants.REQUEST_TERMINATED, System.currentTimeMillis() - startTime, resp.getResponseDescription());
        return setResponseEntity(resp);
    }
}
