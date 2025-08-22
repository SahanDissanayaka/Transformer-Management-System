package com.TransformerUI.TransformerUI.repository;

import com.TransformerUI.TransformerUI.entity.ImageDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImageDataRepository extends JpaRepository<ImageDataEntity, Long> {

    // Find by composite key (transformerNo + inspectionNo)
    Optional<ImageDataEntity> findByTransformerNoAndInspectionNo(String transformerNo, String inspectionNo);

    // Check existence by composite key
    boolean existsByTransformerNoAndInspectionNo(String transformerNo, String inspectionNo);

    // Delete by composite key
    void deleteByTransformerNoAndInspectionNo(String transformerNo, String inspectionNo);
}
