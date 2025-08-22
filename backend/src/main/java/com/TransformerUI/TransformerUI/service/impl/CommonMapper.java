package com.TransformerUI.TransformerUI.service.impl;

import org.springframework.stereotype.Component;

import java.lang.reflect.Field;

@Component
public class CommonMapper {

    // Create new entity from DTO
    public static <S, T> T map(S source, Class<T> targetClass) {
        try {
            T target = targetClass.getDeclaredConstructor().newInstance();
            copyFields(source, target);
            return target;
        } catch (Exception e) {
            throw new RuntimeException("Mapping failed", e);
        }
    }

    // Update existing entity from DTO
    public static <S, T> void update(S source, T target) {
        copyFields(source, target);
    }

    // Core field-copy logic
    private static <S, T> void copyFields(S source, T target) {
        for (Field sourceField : source.getClass().getDeclaredFields()) {
            sourceField.setAccessible(true);
            try {
                Object value = sourceField.get(source);

                Field targetField = null;
                try {
                    targetField = target.getClass().getDeclaredField(sourceField.getName());
                } catch (NoSuchFieldException ignored) {
                    continue;
                }

                targetField.setAccessible(true);

                // only update if compatible types
                if (targetField.getType().isAssignableFrom(sourceField.getType())) {
                    if (value != null) { // <-- optional: avoid overwriting with null
                        targetField.set(target, value);
                    }
                }
            } catch (IllegalAccessException ignored) {
            }
        }
    }
}
