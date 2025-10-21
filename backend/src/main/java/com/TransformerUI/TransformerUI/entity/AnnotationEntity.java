package com.TransformerUI.TransformerUI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "annotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnotationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "annotation_seq")
    @SequenceGenerator(name = "annotation_seq", sequenceName = "annotation_seq", allocationSize = 1)
    private Long id;

    @Column(name = "transformer_no", nullable = false)
    private String transformerNo;

    @Column(name = "inspection_no", nullable = false)
    private String inspectionNo;

    @Column(name = "bbox", nullable = false, length = 500)
    private String bbox; // Stored as JSON array: [x1, y1, x2, y2]

    @Column(name = "polygon", length = 2000)
    private String polygon; // Stored as JSON array of points: [[x1,y1],[x2,y2],...]

    @Column(name = "shape", length = 20)
    private String shape; // 'bbox' or 'polygon'

    @Column(name = "class_name", nullable = false, length = 100)
    private String className;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "annotation_type", nullable = false, length = 50)
    private String annotationType; // AI_DETECTED, MANUAL_ADDED, EDITED, DELETED

    @Column(name = "status", length = 20)
    private String status; // pending, accepted, rejected

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "user_id", length = 100)
    private String userId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
