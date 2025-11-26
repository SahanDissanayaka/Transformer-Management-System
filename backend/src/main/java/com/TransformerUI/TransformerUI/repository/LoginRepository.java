package com.TransformerUI.TransformerUI.repository;

import com.TransformerUI.TransformerUI.entity.LoginEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginRepository extends JpaRepository<LoginEntity, Long>, JpaSpecificationExecutor<LoginEntity> {
    Optional<LoginEntity> findByUsernameAndPassword(String username, String password);
}
