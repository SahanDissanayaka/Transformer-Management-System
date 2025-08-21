package com.TransformerUI.TransformerUI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.text.SimpleDateFormat;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "inspectiondata")
public class InspectionDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "inspectiondata_id_seq")
    @SequenceGenerator(name = "inspectiondata_id_seq", sequenceName = "inspectiondata_id_seq", allocationSize = 1)
    private Long id;

    private String branch;

    @Column(name = "inspectionno")
    private String inspectionNo;

    @Column(name = "transformerno")
    private String transformerNo;

    @Column(name = "inspecteddate")
    private String inspectedDate;

    @Builder.Default
    @Column(name = "maintenancedate")
    private String maintenanceDate = new SimpleDateFormat("EEE(dd), MMM, yyyy hh:mm a").format(new Date());

    @Builder.Default
    private String status = "Pending";
}
