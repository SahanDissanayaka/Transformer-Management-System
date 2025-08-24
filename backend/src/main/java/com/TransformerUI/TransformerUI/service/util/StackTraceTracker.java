package com.TransformerUI.TransformerUI.service.util;

import org.springframework.stereotype.Component;

@Component
public class StackTraceTracker {
    private StackTraceTracker() {
    }

    public static String displayStackStraceArray(StackTraceElement[] stackTraceElements) {
        StringBuilder stringBuilder = new StringBuilder();
        if (stackTraceElements != null) {
            for (StackTraceElement elem : stackTraceElements) {
                if (elem.getClassName().startsWith("com.adl.et.telco.dte.template.baseapp") && elem.getLineNumber() > 0) {
                    stringBuilder.append(elem.toString());
                    break;
                }
            }
        }
        return stringBuilder.toString();
    }
}
