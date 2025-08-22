package com.TransformerUI.TransformerUI.transport.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransformerDataRequest {
    private Long id;
    private String region;
    private String transformerNo;
    private String poleNo;
    private String type;
    private String locationDetails;
}
