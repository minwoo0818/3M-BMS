package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.SalesHistoryOutboundDto.SalesHistoryOutboundDto;
import com.mini_mes_3m_back.entity.SalesOutbound;
import com.mini_mes_3m_back.repository.SalesHistoryOutboundRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesHistoryOutboundService {
    private final SalesHistoryOutboundRepository outboundRepository;

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
}




