package com.TransformerUI.TransformerUI.transport.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransformerDataResponse {
    private Long id;
    private String region;
    private String transformerNo;
    private String poleNo;
    private String type;
}
