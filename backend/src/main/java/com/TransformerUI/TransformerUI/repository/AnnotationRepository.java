package com.TransformerUI.TransformerUI.repository;

import com.TransformerUI.TransformerUI.entity.AnnotationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnotationRepository extends JpaRepository<AnnotationEntity, Long> {

    List<AnnotationEntity> findByTransformerNoAndInspectionNo(String transformerNo, String inspectionNo);

    void deleteByTransformerNoAndInspectionNo(String transformerNo, String inspectionNo);
}
