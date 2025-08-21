package com.TransformerUI.TransformerUI.transport.response;

public enum ResponseCodeEnum {
    SUCCESS("2000","Operation Successful"),
    PARTIAL_SUCCESS("2007", "Partial Success"),
    OPERATION_FAILED("5000", "Operation Failed!"),
    NOT_FOUND("4000","Not found"),
    INTERNAL_SERVER_ERROR("5000","Internal Server Error"),
    TRANSFORMER_NOT_CREATED("5000", "Transformer is partially created or not created"),
    INSPECTION_NOT_CREATED("5000", "Inspection is partially created or not created"),
    INSPECTION_NOT_UPDATED("5000", "Inspection is partially updated or not updated"),
    TRANSFORMER_NOT_UPDATED("5000", "Transformer is partially updated or not updated"),
    INSPECTION_NOT_CONNECTED("5000","Inspection is not connected"),
    TRANSFORMER_NOT_CONNECTED("5000","Transformer is not connected"),
    INSPECTION_NOT_DELETED("5000", "Inspection is not deleted"),
    TRANSFORMER_NOT_DELETED("5000", "Transformer is not deleted"),
    BAD_REQUEST("4000", "Bad Request");

    private String code;
    private String message;
    ResponseCodeEnum(String code, String message) {
        this.code = code;
        this.message = message;
    }
    public String code() {
        return code;
    }
    public String message() { return message; }
}
