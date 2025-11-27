package com.TransformerUI.TransformerUI.transport.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InspectionDataResponse {
    private Long id;
    private String inspectionNo;
    private String transformerNo;   // ✅ REQUIRED for filtering to work
    private String inspectedDate;
    private String maintenanceDate;
    private String status;
    private String branch;
    // Engineer fields
    private String inspectorName;
    private String engineerStatus;
    private String voltage;
    private String current;
    private String recommendedAction;
    private String additionalRemarks;
}
