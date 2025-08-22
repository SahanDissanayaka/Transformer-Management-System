package com.TransformerUI.TransformerUI.transport.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilterRequest {
    private List<FilterValue> filterValues;
    private String tableTemplateId;
    private Boolean defaultTableTemplate;
    private Integer offset;
    private Integer limit;
}
