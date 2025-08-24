package com.TransformerUI.TransformerUI.transport.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ApiResponse<T> {

    private String responseCode;
    private String responseDescription;
    private T responseData;
    private PageDetail pageDetail;

    public ApiResponse(String responseCode, String responseDescription, T responseData) {
        this.responseCode = responseCode;
        this.responseDescription = responseDescription;
        this.responseData = responseData;
    }


    public ApiResponse(String responseCode, String responseDescription) {
        this.responseCode = responseCode;
        this.responseDescription = responseDescription;
    }

}
