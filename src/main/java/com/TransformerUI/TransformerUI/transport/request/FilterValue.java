package com.TransformerUI.TransformerUI.transport.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilterValue {
    private String columnName;
    private String operation;
    private Object[] value;
}
