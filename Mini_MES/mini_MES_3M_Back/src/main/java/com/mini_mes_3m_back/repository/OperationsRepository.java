package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.Operations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperationsRepository extends JpaRepository<Operations, Long> {
    Optional<Operations> findByCode(String code);
}