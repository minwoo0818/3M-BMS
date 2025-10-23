package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundDetailResponseDto;
import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundHistoryResponseDto;
import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundUpdateRequestDto;
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

        String lotNumber = generateLotNumber(request.getReceivedAt());

        SalesInbound salesInbound = SalesInbound.builder()
                .item(salesItem)
                .qty(request.getQty())
                .receivedAt(request.getReceivedAt())
                .inboundLOTNum(lotNumber)
                // isCancelled, isOutboundProcessed는 @Builder.Default 덕분에 명시적으로 설정하지 않아도 false로 초기화됨
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
                savedInbound.getCreatedAt(),
                savedInbound.getItem().getCoatingMethod()
        );
    }

    // --- 3. 입고 이력 목록 조회 ---
    @Transactional(readOnly = true)
    public List<SalesInboundHistoryResponseDto> getSalesInboundHistory(String keyword) {
        List<SalesInbound> salesInbounds = salesInboundRepository.findActiveSalesInboundsWithSearch(keyword);

        return salesInbounds.stream()
                .map(si -> {
                    // SalesItem과 Partner는 이미 fetch join으로 가져왔으므로 null 체크 불필요
                    // 만약 Partner.name이 엔티티에 없다면 si.item.partner.name()
                    String customerName = (si.getItem().getPartner() != null) ? si.getItem().getPartner().getName() : si.getItem().getPartnerName();

                    return new SalesInboundHistoryResponseDto(
                            si.getInboundId(),
                            si.getItem().getSalesItemId(),
                            customerName, // 거래처명
                            si.getItem().getItemCode(),
                            si.getItem().getItemName(),
                            si.getItem().getClassification(),
                            si.getItem().getCoatingMethod(),
                            si.getInboundLOTNum(),
                            si.getQty(),
                            si.getReceivedAt(),
                            si.getItem().getRemark(), // SalesItem의 비고
                            si.getIsCancelled(),
                            si.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    // --- 4. 입고 이력 상세 조회 ---
    @Transactional(readOnly = true)
    public SalesInboundDetailResponseDto getSalesInboundDetail(Long inboundId) {
        SalesInbound salesInbound = salesInboundRepository.findByInboundIdWithItemAndPartner(inboundId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 입고 이력입니다. ID: " + inboundId));

        return new SalesInboundDetailResponseDto(
                salesInbound.getInboundId(),
                salesInbound.getItem().getSalesItemId(),
                salesInbound.getItem().getPartner().getName(), // 거래처명
                salesInbound.getItem().getItemCode(),
                salesInbound.getItem().getItemName(),
                salesInbound.getItem().getClassification(),
                salesInbound.getItem().getUnit(), // 품목 단위
                salesInbound.getItem().getPrice(), // 품목 가격
                salesInbound.getItem().getColor(), // 품목 색상
                salesInbound.getItem().getCoatingMethod(), // 품목 도장 방법
                salesInbound.getInboundLOTNum(),
                salesInbound.getQty(),
                salesInbound.getReceivedAt(),
                salesInbound.getItem().getRemark(), // SalesItem의 비고
                salesInbound.getIsCancelled(),
                salesInbound.getIsOutboundProcessed(),
                salesInbound.getCreatedAt(),
                salesInbound.getUpdatedAt()
        );
    }

    // --- 5. 입고 이력 수정 ---
    @Transactional
    public SalesInboundDetailResponseDto updateSalesInbound(Long inboundId, SalesInboundUpdateRequestDto request) {
        SalesInbound salesInbound = salesInboundRepository.findById(inboundId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 입고 이력입니다. ID: " + inboundId));

        // 이미 출고 처리되었거나 취소된 입고는 수정 불가
        if (salesInbound.getIsOutboundProcessed()) {
            throw new IllegalArgumentException("이미 출고 처리된 입고는 수정할 수 없습니다.");
        }
        if (salesInbound.getIsCancelled()) {
            throw new IllegalArgumentException("이미 취소된 입고는 수정할 수 없습니다.");
        }

        // 수량 및 일자 업데이트
        salesInbound.setQty(request.getQty());
        salesInbound.setReceivedAt(request.getReceivedAt());

        SalesInbound updatedInbound = salesInboundRepository.save(salesInbound);

        // 업데이트된 정보 반환 DTO로 변환 (getSalesInboundDetail과 동일)
        return getSalesInboundDetail(updatedInbound.getInboundId());
    }

    // --- 6. 입고 이력 삭제 (취소) ---
    @Transactional
    public void cancelSalesInbound(Long inboundId) {
        SalesInbound salesInbound = salesInboundRepository.findById(inboundId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 입고 이력입니다. ID: " + inboundId));

        // 이미 출고 처리되었거나 이미 취소된 입고는 삭제(취소) 불가
        if (salesInbound.getIsOutboundProcessed()) {
            throw new IllegalArgumentException("이미 출고 처리된 입고는 취소할 수 없습니다.");
        }
        if (salesInbound.getIsCancelled()) {
            throw new IllegalArgumentException("이미 취소된 입고입니다.");
        }

        salesInbound.setIsCancelled(true); // isCancelled 플래그를 true로 변경하여 취소 처리
        salesInboundRepository.save(salesInbound);

        // TODO: 재고 관리를 한다면 여기에서 SalesItem 또는 별도의 재고 엔티티의 재고를 감소시켜야 함
    }

    // --- LOT 번호 자동 부여 헬퍼 메서드 ---
    private String generateLotNumber(LocalDate receivedAt) { // inboundDate -> receivedAt으로 변경
        String datePrefix = receivedAt.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "LOT-" + datePrefix + "-";
        long count = salesInboundRepository.countByInboundLOTNumStartingWith(prefix); // inboundLOTNum 필드명에 맞게 변경!
        return prefix + String.format("%03d", count + 1); // 001, 002 형식으로 부여
    }
}