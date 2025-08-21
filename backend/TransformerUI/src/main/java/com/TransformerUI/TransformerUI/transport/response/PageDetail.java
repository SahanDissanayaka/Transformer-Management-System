package com.TransformerUI.TransformerUI.transport.response;

import lombok.Data;

@Data
public class PageDetail {
    private String totalRecords;
    private String pageNumber;
    private String pageElementCount;
}