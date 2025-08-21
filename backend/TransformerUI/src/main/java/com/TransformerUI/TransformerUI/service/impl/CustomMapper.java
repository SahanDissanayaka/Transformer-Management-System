package com.TransformerUI.TransformerUI.service.impl;

import com.TransformerUI.TransformerUI.entity.InspectionDataEntity;
import com.TransformerUI.TransformerUI.service.util.SequenceGeneratorService;
import com.TransformerUI.TransformerUI.transport.request.InspectionDataRequest;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Component
public class CustomMapper {

    private static final String INSPECTION_SEQUENCE = "inspectiondata_seq";

    private static final SimpleDateFormat inputFormat =
            new SimpleDateFormat("yyyy-MM-dd hh:mm a");
    private static final SimpleDateFormat outputFormat =
            new SimpleDateFormat("EEE(dd), MMM, yyyy hh:mm a");

    private final SequenceGeneratorService sequenceGeneratorService;

    public CustomMapper(SequenceGeneratorService sequenceGeneratorService) {
        this.sequenceGeneratorService = sequenceGeneratorService;
    }

    public InspectionDataEntity toEntity(InspectionDataRequest request) {
        String inspectedDate = formatInspectionDate(request.getInspectionDate(), request.getTime());

        // Generate new inspection number
        String inspectionNo = "INSP-" + sequenceGeneratorService.generateSequence(INSPECTION_SEQUENCE);

        return InspectionDataEntity.builder()
                .branch(request.getBranch())
                .transformerNo(request.getTransformerNo())
                .inspectionNo(inspectionNo)
                .inspectedDate(inspectedDate)
                .status("Pending") // default
                .build();
    }

    public void updateEntity(InspectionDataEntity existingEntity, InspectionDataRequest request) {
        if (request.getBranch() != null) {
            existingEntity.setBranch(request.getBranch());
        }

        if (request.getTransformerNo() != null) {
            existingEntity.setTransformerNo(request.getTransformerNo());
        }

        if (request.getInspectionDate() != null && request.getTime() != null) {
            String inspectedDate = formatInspectionDate(request.getInspectionDate(), request.getTime());
            existingEntity.setInspectedDate(inspectedDate);
        }
    }

    private String formatInspectionDate(String inspectionDate, String time) {
        try {
            if (inspectionDate != null && time != null) {
                String combined = inspectionDate + " " + time;
                Date parsedDate = inputFormat.parse(combined);
                return outputFormat.format(parsedDate);
            }
        } catch (ParseException e) {
            throw new RuntimeException("Invalid date/time format: " + inspectionDate + " " + time, e);
        }
        return null;
    }
}
