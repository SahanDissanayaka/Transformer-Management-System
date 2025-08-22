package com.TransformerUI.TransformerUI.transport.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageRequest {
    private String transformerNo;
    private String inspectionNo;
    private String type;
    private MultipartFile photo;
}
