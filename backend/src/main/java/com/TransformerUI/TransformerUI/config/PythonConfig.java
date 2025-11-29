package com.TransformerUI.TransformerUI.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class PythonConfig {

    @Value("${python.exec:/usr/bin/python3.10}")  // default path if not provided
    private String pythonExec;

    @PostConstruct
    public void setPythonPath() {
        System.setProperty("python.exec", pythonExec);
        System.out.println("Python executable set to: " + pythonExec);
    }
}
