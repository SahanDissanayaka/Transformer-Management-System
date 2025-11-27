package com.TransformerUI.TransformerUI.transport.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InspectionDataRequest {
    private Long id;
    private String branch;
    private String transformerNo;
    private String inspectionDate;
    private String time;
    // Engineer fields
    private String inspectorName;
    private String engineerStatus;
    private String voltage;
    private String current;
    private String recommendedAction;
    private String additionalRemarks;

}
