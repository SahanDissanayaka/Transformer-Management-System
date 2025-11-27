package com.TransformerUI.TransformerUI.transport.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecordResponse {
    private Long id;
    private Long inspectionId;

    // Location & Basic Info
    private String poleNo;
    private String locationDetails;
    private String type;
    private String inspected;

    // Infrared Readings
    private String irLeft;
    private String irRight;
    private String irFront;

    // Power Readings
    private String lastMonthKva;
    private String lastMonthDate;
    private String lastMonthTime;
    private String currentMonthKva;

    // Equipment Details
    private String serial;
    private Integer meterCtRatio;
    private String make;

    // Maintenance Personnel & Timings
    private String startTime;
    private String completionTime;
    private String supervisedBy;

    // Technicians & Helpers
    private String techI;
    private String techII;
    private String techIII;
    private String helpers;

    // Inspection Sign-offs
    private String inspectedBy;
    private String inspectedByDate;
    private String reflectedBy;
    private String reflectedByDate;
    private String reInspectedBy;
    private String reInspectedByDate;

    // CSS
    private String css;
    private String cssDate;

    // Timestamps
    private String createdAt;
    private String updatedAt;
}
