package com.TransformerUI.TransformerUI.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "transformerdata")
public class TransformerDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "transformerdata_seq")
    @SequenceGenerator(name = "transformerdata_seq", sequenceName = "transformerdata_seq", allocationSize = 1)
    private Long id;
    private String region;
    @Column(name = "transformerno")
    private String transformerNo;
    @Column(name = "poleno")
    private String poleNo;
    private String type;

    @Column(name = "locationdetails")
    private String locationDetails;
}
