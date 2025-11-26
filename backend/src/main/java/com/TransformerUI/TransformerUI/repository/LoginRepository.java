package com.TransformerUI.TransformerUI.repository;

import com.TransformerUI.TransformerUI.entity.LoginEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginRepository extends JpaRepository<LoginEntity, Long>, JpaSpecificationExecutor<LoginEntity> {
}
