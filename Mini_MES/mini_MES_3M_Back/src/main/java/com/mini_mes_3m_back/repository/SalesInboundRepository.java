package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesInbound;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SalesInboundRepository extends JpaRepository<SalesInbound, Long> {
    // 특정 날짜의 LOT 번호 자동 부여를 위한 count
    long countByInboundLOTNumStartingWith(String prefix); // inboundLOTNum 필드명에 맞게 변경!

    // 기타 필요한 조회 메서드 추가 가능

    //수주품목 출고 등록할때 조회
    Page<SalesInbound> findByQtyAndIsCancelledFalseAndIsOutboundProcessedFalse(int qty, Pageable pageable);

    Page<SalesInbound> findByInboundLOTNumContainingAndIsCancelledFalseAndIsOutboundProcessedFalse(String lotNum, Pageable pageable);

    Page<SalesInbound> findByItem_ItemNameContainingAndIsCancelledFalseAndIsOutboundProcessedFalse(String itemName, Pageable pageable);

    Page<SalesInbound> findByItem_ItemCodeContainingAndIsCancelledFalseAndIsOutboundProcessedFalse(String itemCode, Pageable pageable);

    Page<SalesInbound> findByItem_PartnerNameContainingAndIsCancelledFalseAndIsOutboundProcessedFalse(String partnerName, Pageable pageable);

    Page<SalesInbound> findByReceivedAtAndIsCancelledFalseAndIsOutboundProcessedFalse(LocalDate receivedAt, Pageable pageable);

    Page<SalesInbound> findByIsCancelledFalseAndIsOutboundProcessedFalse(Pageable pageable);
    // 입고 이력 목록 조회 (SalesItem과 Partner를 함께 가져옴)
    @Query("SELECT si FROM SalesInbound si JOIN FETCH si.item salesItem JOIN FETCH salesItem.partner partner " +
            "WHERE si.isCancelled = false " + // 취소되지 않은 입고만 조회
            "AND salesItem.active = true AND partner.active = true " + // 활성화된 SalesItem, Partner만
            "AND (:keyword IS NULL OR :keyword = '' OR " + // 키워드가 없으면 모두
            "LOWER(partner.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 거래처명
            "LOWER(salesItem.itemCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 품목 번호
            "LOWER(salesItem.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 품목명
            "LOWER(si.inboundLOTNum) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 입고번호 (LOT번호)
            "LOWER(salesItem.coatingMethod) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 도장방식
            "LOWER(FUNCTION('DATE_FORMAT', si.receivedAt, '%Y-%m-%d')) LIKE LOWER(CONCAT('%', :keyword, '%')))") // 입고일자 (YYYY-MM-DD)
    List<SalesInbound> findActiveSalesInboundsWithSearch(@Param("keyword") String keyword);

    // 특정 입고 ID로 상세 조회 (SalesItem과 Partner를 함께 가져옴)
    @Query("SELECT si FROM SalesInbound si JOIN FETCH si.item salesItem JOIN FETCH salesItem.partner partner " +
            "WHERE si.inboundId = :inboundId")
    Optional<SalesInbound> findByInboundIdWithItemAndPartner(@Param("inboundId") Long inboundId);

    // 이미 등록된 입고번호(LOT)가 있는지 확인
    Optional<SalesInbound> findByInboundLOTNum(String inboundLOTNum);
}
