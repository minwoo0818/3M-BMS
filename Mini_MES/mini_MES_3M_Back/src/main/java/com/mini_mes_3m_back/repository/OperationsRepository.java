package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.Operations;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OperationsRepository extends JpaRepository<Operations, Long> {
    // 공정 코드 또는 공정명으로 검색 (대소문자 무시)
    List<Operations> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(String code, String name);
}
