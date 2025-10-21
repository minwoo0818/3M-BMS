package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.RawItemInbound.RawInboundRegisterRequestDto;
import com.mini_mes_3m_back.dto.RawItemInbound.RawInboundResponseDto;
import com.mini_mes_3m_back.dto.RawItemInbound.RawItemInboundEligibleItemDto;
import com.mini_mes_3m_back.entity.RawInbound;
import com.mini_mes_3m_back.entity.RawsItem;
import com.mini_mes_3m_back.repository.RawInboundRepository;
import com.mini_mes_3m_back.repository.RawsItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RawItemInboundService {

    private final RawsItemRepository rawsItemRepository;
    private final RawInboundRepository rawInboundRepository;

    public RawItemInboundService(RawsItemRepository rawsItemRepository, RawInboundRepository rawInboundRepository) {
        this.rawsItemRepository = rawsItemRepository;
        this.rawInboundRepository = rawInboundRepository;
    }

    // --- 1. 원자재 품목 목록 조회 (입고 등록용) ---
    @Transactional(readOnly = true)
    public List<RawItemInboundEligibleItemDto> getInboundEligibleRawsItems(String keyword) {
        List<RawsItem> rawsItems;
        if (keyword != null && !keyword.trim().isEmpty()) {
            rawsItems = rawsItemRepository.searchActiveRawsItemsForInbound(keyword);
        } else {
            rawsItems = rawsItemRepository.findActiveRawsItemsForInboundEligible();
        }

        return rawsItems.stream()
                .filter(ri -> ri.getSupplier() != null && ri.getSupplier().getActive()) // 매입처도 활성화되어 있는지 재확인
                .map(ri -> new RawItemInboundEligibleItemDto(
                        ri.getRawsItemId(),
                        ri.getSupplier().getPartnerId(),
                        ri.getSupplier().getName(),
                        ri.getItemCode(),
                        ri.getItemName(),
                        ri.getSpec(),
                        ri.getManufacturer(),
                        ri.getRemark(),
                        ri.getColor()
                ))
                .collect(Collectors.toList());
    }

    // --- 2. 원자재 품목 입고 등록 ---
    @Transactional
    public RawInboundResponseDto registerRawInbound(RawInboundRegisterRequestDto request) {
        RawsItem rawsItem = rawsItemRepository.findById(request.getRawsItemId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 원자재 품목입니다. ID: " + request.getRawsItemId()));

        // 입고 번호 생성 (MINC-yyyyMMdd-001)
        String rawInboundNum = generateRawInboundNum(request.getInboundDate());

        RawInbound rawInbound = RawInbound.builder()
                .rawsItem(rawsItem)
                .qty(request.getQty())
                .inboundDate(request.getInboundDate())
                .manufacturingDate(request.getManufacturingDate())
                .rawInboundNum(rawInboundNum)
                .build();

        RawInbound savedInbound = rawInboundRepository.save(rawInbound);

        // TODO: 재고 관리를 한다면 여기에서 RawsItem 또는 별도의 재고 엔티티의 재고를 증가시켜야 함

        return new RawInboundResponseDto(
                savedInbound.getRawInboundId(),
                savedInbound.getRawInboundNum(),
                savedInbound.getRawsItem().getRawsItemId(),
                savedInbound.getRawsItem().getItemName(),
                savedInbound.getQty(),
                savedInbound.getInboundDate(),
                savedInbound.getManufacturingDate(),
                savedInbound.getCreatedAt()
        );
    }

    // --- 입고 번호 자동 부여 헬퍼 메서드 ---
    private String generateRawInboundNum(LocalDate inboundDate) {
        String datePrefix = inboundDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "MINC-" + datePrefix + "-";
        long count = rawInboundRepository.countByRawInboundNumStartingWith(prefix);
        return prefix + String.format("%03d", count + 1); // 001, 002 형식으로 부여
    }
}