package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesItemOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesItemOperationRepository extends JpaRepository<SalesItemOperation, Long> {
    java.util.List<SalesItemOperation> findBySalesItem_SalesItemIdOrderBySeqAsc(Long salesItemId);
}