package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesOutbound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesHistoryOutboundRepository extends JpaRepository<SalesOutbound, Long> {

    @Query("SELECT o FROM SalesOutbound o " +
            "JOIN FETCH o.inbound i " +
            "JOIN FETCH i.item si " +
            "WHERE o.isCancelled = false")
    List<SalesOutbound> findAllWithFetch();

    /**
     * 키워드 기반 출고 이력 검색 (fetch join으로 Lazy 문제 방지)
     * 검색 대상: 거래처명, 품목명, 품목번호, 출고번호, 출고일자
     */
    @Query("SELECT o FROM SalesOutbound o " +
            "JOIN FETCH o.inbound i " +
            "JOIN FETCH i.item si " +
            "WHERE o.isCancelled = false AND (" +
            "LOWER(si.partnerName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(si.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(si.itemCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.outboundOUTNum) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(si.classification) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(FUNCTION('DATE_FORMAT', o.shippedAt, '%Y-%m-%d')) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
            ")")
    List<SalesOutbound> findActiveOutboundsWithSearch(@Param("keyword") String keyword);

    /**
     * 전체 출고 이력 조회 (fetch join 포함)
     */
    @Query("SELECT o FROM SalesOutbound o " +
            "JOIN FETCH o.inbound i " +
            "JOIN FETCH i.item si " +
            "WHERE o.isCancelled = false")
    List<SalesOutbound> findAllActiveOutbounds();
}
