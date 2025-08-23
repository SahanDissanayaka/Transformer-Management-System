package com.TransformerUI.TransformerUI.transport.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageResponse {
    private Long id;
    private String transformerNo;
    private String inspectionNo;
    private String type;
    private String environmentalCondition;
    private String photoBase64;
}
