package com.TransformerUI.TransformerUI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecordEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "maintenance_records_seq")
    @SequenceGenerator(name = "maintenance_records_seq", sequenceName = "maintenance_records_seq", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private InspectionDataEntity inspection;

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

    // Timestamp
    @Builder.Default
    private String createdAt = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date());

    private String updatedAt;
}
