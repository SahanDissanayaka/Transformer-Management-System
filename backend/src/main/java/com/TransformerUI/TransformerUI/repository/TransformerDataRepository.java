package com.TransformerUI.TransformerUI.repository;

import com.TransformerUI.TransformerUI.entity.TransformerDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TransformerDataRepository extends JpaRepository<TransformerDataEntity, Long>, JpaSpecificationExecutor<TransformerDataEntity> {
}
