package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesItemOperation; // ⭐️ import 수정/확인
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesItemOperationRepository extends JpaRepository<SalesItemOperation, Long> {
    // List로 수정 (java.util.List 대신)
    List<SalesItemOperation> findBySalesItem_SalesItemIdOrderBySeqAsc(Long salesItemId);
}