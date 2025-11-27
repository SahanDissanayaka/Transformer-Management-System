package com.TransformerUI.TransformerUI.repository;

import com.TransformerUI.TransformerUI.entity.MaintenanceRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecordEntity, Long> {
    List<MaintenanceRecordEntity> findByInspectionId(Long inspectionId);
    Optional<MaintenanceRecordEntity> findByIdAndInspectionId(Long id, Long inspectionId);
}
