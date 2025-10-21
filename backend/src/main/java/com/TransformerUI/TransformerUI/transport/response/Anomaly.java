package com.TransformerUI.TransformerUI.transport.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Anomaly {
    @JsonProperty("class")
    private String errorType;
    private double confidence;
    private List<Double> box;
}
