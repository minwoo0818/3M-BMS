package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.Inventory;
import com.mini_mes_3m_back.entity.RawsItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByRawItem(RawsItem rawItem); // 특정 RawsItem에 대한 재고 조회
    // 활성화된 RawsItem의 재고 현황을 검색 및 페이징 없이 조회 (단순 목록으로 일단 처리)
    // 매입처명, 품목 번호, 품목명으로 검색 가능
    @Query("SELECT i FROM Inventory i JOIN FETCH i.rawItem ri JOIN FETCH ri.supplier s " +
            "WHERE ri.active = true AND s.active = true " + // 활성화된 원자재와 매입처만
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 매입처명
            "LOWER(ri.itemCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 품목 번호
            "LOWER(ri.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')))") // 품목명
    List<Inventory> searchActiveInventories(@Param("keyword") String keyword);
}