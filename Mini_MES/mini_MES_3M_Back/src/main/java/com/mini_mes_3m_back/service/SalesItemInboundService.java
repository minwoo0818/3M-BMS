package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.SalesItemInbound.SalesInboundRegisterRequestDto;
import com.mini_mes_3m_back.dto.SalesItemInbound.SalesInboundResponseDto;
import com.mini_mes_3m_back.dto.SalesItemInbound.SalesItemInboundListResponseDto;
import com.mini_mes_3m_back.entity.SalesInbound;
import com.mini_mes_3m_back.entity.SalesItem;
import com.mini_mes_3m_back.repository.SalesInboundRepository;
import com.mini_mes_3m_back.repository.SalesItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesItemInboundService {

    private final SalesItemRepository salesItemRepository;
    private final SalesInboundRepository salesInboundRepository;

    public SalesItemInboundService(SalesItemRepository salesItemRepository, SalesInboundRepository salesInboundRepository) {
        this.salesItemRepository = salesItemRepository;
        this.salesInboundRepository = salesInboundRepository;
    }

    // --- 1. 수주대상 품목 목록 조회 (입고 등록용) ---
    @Transactional(readOnly = true)
    public List<SalesItemInboundListResponseDto> getInboundEligibleSalesItems(String keyword) {
        List<SalesItem> salesItems;
        if (keyword != null && !keyword.trim().isEmpty()) {
            salesItems = salesItemRepository.searchActiveSalesItems(keyword);
        } else {
            salesItems = salesItemRepository.findActiveSalesItemsWithActivePartner();
        }

        return salesItems.stream()
                .filter(si -> si.getPartner() != null && si.getPartner().getActive())
                .map(si -> new SalesItemInboundListResponseDto(
                        si.getSalesItemId(),
                        si.getPartner().getPartnerId(),
                        si.getPartnerName(),
                        si.getItemCode(),
                        si.getItemName(),
                        si.getClassification(),
                        si.getRemark()
                ))
                .collect(Collectors.toList());
    }

    // --- 2. 수주대상 품목 입고 등록 ---
    @Transactional
    public SalesInboundResponseDto registerSalesInbound(SalesInboundRegisterRequestDto request) {
        SalesItem salesItem = salesItemRepository.findById(request.getSalesItemId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 수주 품목입니다. ID: " + request.getSalesItemId()));

        // LOT 번호 생성 (LOT-yyyyMMdd-001)
        // inboundLOTNum은 receivedAt을 기준으로 생성.
        String lotNumber = generateLotNumber(request.getReceivedAt()); // inboundLOTNum으로 변경

        SalesInbound salesInbound = SalesInbound.builder()
                .item(salesItem) // SalesItem -> item으로 필드명 변경
                .qty(request.getQty()) // inboundQuantity -> qty로 필드명 변경
                .receivedAt(request.getReceivedAt()) // inboundDate -> receivedAt으로 필드명 변경
                .inboundLOTNum(lotNumber) // lotNumber -> inboundLOTNum으로 필드명 변경
                .build();

        SalesInbound savedInbound = salesInboundRepository.save(salesInbound);

        // TODO: 재고 관리를 한다면 여기에서 SalesItem 또는 별도의 재고 엔티티의 재고를 증가시켜야 함

        return new SalesInboundResponseDto(
                savedInbound.getInboundId(), // salesInboundId -> inboundId로 필드명 변경
                savedInbound.getItem().getSalesItemId(), // SalesItem ID
                savedInbound.getItem().getItemName(), // SalesItem 이름
                savedInbound.getQty(), // inboundQuantity -> qty로 필드명 변경
                savedInbound.getReceivedAt(), // inboundDate -> receivedAt으로 필드명 변경
                savedInbound.getInboundLOTNum(), // lotNumber -> inboundLOTNum으로 필드명 변경
                savedInbound.getCreatedAt()
        );
    }

    // --- LOT 번호 자동 부여 헬퍼 메서드 ---
    private String generateLotNumber(LocalDate receivedAt) { // inboundDate -> receivedAt으로 변경
        String datePrefix = receivedAt.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "LOT-" + datePrefix + "-";
        long count = salesInboundRepository.countByInboundLOTNumStartingWith(prefix); // inboundLOTNum 필드명에 맞게 변경!
        return prefix + String.format("%03d", count + 1); // 001, 002 형식으로 부여
    }
}