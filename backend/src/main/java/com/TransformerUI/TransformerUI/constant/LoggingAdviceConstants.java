package com.TransformerUI.TransformerUI.constant;

public class LoggingAdviceConstants {

    private LoggingAdviceConstants(){}
    public static final String SCM_CONTEXT_UPDATE = "SCM_CONTEXT_UPDATE|{}|TYPE:{}|MESSAGE:{}";
    public static final String SCM_CONTEXT_UPDATE_DETAIL = "SCM_CONTEXT_UPDATE|0|TYPE:{}|RESPONSE:{}";
    public static final String REQUEST_INITIATED = "SCM_REQUEST_INITIATED|0|REQUEST_METHOD:{}|REQUEST_URI:{}";
    public static final String SCHEDULER_INITIATED = "SCM_SCHEDULER_INITIATED|0|STARTED_AT:{}";
    public static final String SCHEDULER_TERMINATED = "SCM_SCHEDULER_TERMINATED|{}|ENDED_AT:{}";
    public static final String SCHEDULER_INFO = "SCM_SCHEDULER_INFO|0|MESSAGE:{}";
    public static final String FULL_RESPONSE = "SCM_FULL_RESPONSE|0|CONTROLLER_RESPONSE:{}";
    public static final String REQUEST_TERMINATED = "SCM_REQUEST_TERMINATED|{}|REASON:{}";
    public static final String EXCEPTION_STACK_TRACE = "SCM_EXCEPTION|{}|ERROR_MESSAGE:{}|STACK_TRACE:{}";
    public static final String SERVICE_TERMINATION = "SCM_SERVICE_TERMINATED|{}|MESSAGE:{}";
    public static final String SERVICE_TERMINATION_DETAIL = "SCM_SERVICE_TERMINATED|0|RESPONSE:{}";
    public static final String SCM_DB = "SCM_DB|{}|TYPE:{}|RESPONSE_SIZE:{}";
    public static final String SCM_DB_DETAIL = "SCM_DB_DETAIL|0|QUERY:{}";
    public static final String SCM_REDIS = "SCM_REDIS|{}|TYPE:{}|MESSAGE:{}";
    public static final String SCM_QUEUE = "SCM_QUEUE|{}|TYPE:{}|MESSAGE:{}";
    public static final String EXCEPTION_REDIS = "SCM_REDIS_EXCEPTION|{}|ERROR_MESSAGE:{}";
    public static final String SCM_API_CALL = "SCM_API_CALL|{}|METHOD:{}|API_URL:{}|HTTP_STATUS:{}";
    public static final String API_CALL_EXCEPTION = "SCM_API_CALL_EXCEPTION|{}|METHOD:{}|API_URL:{}|HTTP_STATUS:{}|API_RESPONSE:{}|ERROR_MESSAGE:{}|STACK_TRACE:{}";
    public static final String SCM_API_CALL_DETAIL = "SCM_API_CALL_DETAIL|0|REQUEST_BODY:{}|RESPONSE_HEADERS:{}|RESPONSE_BODY:{}";

}
