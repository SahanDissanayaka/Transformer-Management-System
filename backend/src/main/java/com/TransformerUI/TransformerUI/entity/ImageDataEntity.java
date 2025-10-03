package com.TransformerUI.TransformerUI.entity;

import com.TransformerUI.TransformerUI.transport.response.AnomaliesResponse;
import jakarta.persistence.*;
import lombok.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

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

    @Column(name = "weather")
    private String weather;

    @Builder.Default
    private String uploader =  "System";

    @Builder.Default
    private String dateTime = new SimpleDateFormat("EEE(dd), MMM, yyyy hh:mm a").format(new Date());

    private byte[] image;

    @Column(columnDefinition = "TEXT")
    private String detectionJson;
}



