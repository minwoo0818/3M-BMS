package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.SalesHistoryOutboundDto.SalesHistoryOutboundDto;
import com.mini_mes_3m_back.dto.SalesHistoryOutboundDto.SalesHistoryOutboundUpdateDto;
import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundDetailResponseDto;
import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundUpdateRequestDto;
import com.mini_mes_3m_back.entity.SalesInbound;
import com.mini_mes_3m_back.entity.SalesOutbound;
import com.mini_mes_3m_back.repository.SalesHistoryOutboundRepository;
import com.mini_mes_3m_back.repository.SalesInboundRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesHistoryOutboundService {
    private final SalesHistoryOutboundRepository outboundRepository;
    private final SalesHistoryOutboundRepository salesHistoryOutboundRepository;
    private final SalesInboundRepository inboundRepository;
    private final SalesInboundRepository salesInboundRepository;

    /**
     * 키워드 기반 출고 이력 조회 (DTO 반환)
     * @param keyword 검색 키워드
     * @return SalesHistoryOutboundDto 리스트
     */
    public List<SalesHistoryOutboundDto> searchOutboundHistory(String keyword) {
        List<SalesOutbound> outbounds;
        if (keyword != null && !keyword.trim().isEmpty()) {
            outbounds = outboundRepository.findActiveOutboundsWithSearch(keyword);
        } else {
            outbounds = outboundRepository.findAllWithFetch(); // fetch join 포함
        }

        // 엔티티 -> DTO 변환
        return outbounds.stream()
                .map(this::convertToDto)
                .toList();
    }

    /**
     * 출고 엔티티를 DTO로 변환
     */
    private SalesHistoryOutboundDto convertToDto(SalesOutbound outbound) {
        return SalesHistoryOutboundDto.builder()
                .outboundId(outbound.getOutboundId())
                .outboundOUTNum(outbound.getOutboundOUTNum())
                .partnerName(outbound.getInbound().getItem().getPartnerName())
                .itemCode(outbound.getInbound().getItem().getItemCode())
                .itemName(outbound.getInbound().getItem().getItemName())
                .classification(outbound.getInbound().getItem().getClassification())
                .qty(outbound.getQty())
                .shippedAt(outbound.getShippedAt())
                .createdAt(outbound.getCreatedAt())
                .isCancelled(outbound.getIsCancelled())
                .build();
    }

    // --- 출고 이력 수정 ---
    @Transactional
    public SalesHistoryOutboundDto updateSalesOutbound(Long outboundId, SalesHistoryOutboundUpdateDto request) {
        SalesOutbound salesOutbound = salesHistoryOutboundRepository.findById(outboundId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 출고 이력입니다. ID: " + outboundId));

        if (salesOutbound.getIsCancelled()) {
            throw new IllegalArgumentException("이미 취소된 출고는 수정할 수 없습니다.");
        }

        int updateQty = salesOutbound.getQty() - request.getQty();
        //원래 100개 -> 새로 110개 => -10
        //원래 110개 -> 새로 100개 => 10

        // 수량 및 일자 업데이트
        salesOutbound.setQty(request.getQty());
        salesOutbound.setShippedAt(request.getShippedAt());

        SalesInbound salesInbound = salesOutbound.getInbound();
        salesInbound.setRemainingQty(salesInbound.getRemainingQty() + updateQty);
        salesInboundRepository.save(salesInbound);

        SalesOutbound updatedOutbound = salesHistoryOutboundRepository.save(salesOutbound);

        return convertToDto(updatedOutbound);
    }

    // --- 출고 이력 삭제 (취소) ---
    @Transactional
    public void cancelSalesOutbound(Long outboundId) {
        SalesOutbound salesOutbound = salesHistoryOutboundRepository.findById(outboundId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 입고 이력입니다. ID: " + outboundId));

        // 이미 삭제된 입고는 삭제(취소) 불가

        if (salesOutbound.getIsCancelled()) {
            throw new IllegalArgumentException("이미 삭제된 출고입니다.");
        }

        salesOutbound.setIsCancelled(true); // isCancelled 플래그를 true로 변경하여 취소 처리
        salesHistoryOutboundRepository.save(salesOutbound);

        // TODO: 재고 관리를 한다면 여기에서 SalesItem 또는 별도의 재고 엔티티의 재고를 감소시켜야 함
    }
}




