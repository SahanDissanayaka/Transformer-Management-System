package com.TransformerUI.TransformerUI.entity;

import jakarta.persistence.*;
import lombok.*;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "images")
public class ImageDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "image_seq")
    @SequenceGenerator(name = "image_seq", sequenceName = "image_seq", allocationSize = 1)
    private Long id;

    private String type;

    @Column(name = "transformerno")
    private String transformerNo;

    @Column(name = "inspectionno")
    private String inspectionNo;

    @Column(name = "environmentalcondition")
    private String environmentalCondition;

    private byte[] image;
}
