package com.TransformerUI.TransformerUI.repository;

import com.TransformerUI.TransformerUI.entity.InspectionDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface InspectionDataRepository extends JpaRepository<InspectionDataEntity, Long> , JpaSpecificationExecutor<InspectionDataEntity> {
}
