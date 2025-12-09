// src/main/java/com/mini_mes_3m_back/repository/RawsItemRepository.java (새로 생성!)
package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.RawsItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RawsItemRepository extends JpaRepository<RawsItem, Long> {
    Optional<RawsItem> findByItemCode(String itemCode); // 품목번호로 조회
    List<RawsItem> findByActive(Boolean active); // 활성화 여부로 조회
    // 품목명, 품목번호, 제조사 등 검색을 위한 메서드 추가 가능
    // 입고 등록 가능한 활성화된 원자재 품목 조회
    // (active=true인 RawsItem, active=true인 Supplier Partner만 조회)
    @Query("SELECT ri FROM RawsItem ri JOIN FETCH ri.supplier s " +
            "WHERE ri.active = true AND s.active = true")
    List<RawsItem> findActiveRawsItemsForInboundEligible();

    // 입고 등록을 위한 검색 (매입처명, 품목 번호, 품목명, 제조사)
    @Query("SELECT ri FROM RawsItem ri JOIN FETCH ri.supplier s " +
            "WHERE ri.active = true AND s.active = true " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 매입처명
            "LOWER(ri.itemCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 품목 번호
            "LOWER(ri.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 품목명
            "LOWER(ri.manufacturer) LIKE LOWER(CONCAT('%', :keyword, '%')))") // 제조사
    List<RawsItem> searchActiveRawsItemsForInbound(@Param("keyword") String keyword);
}
