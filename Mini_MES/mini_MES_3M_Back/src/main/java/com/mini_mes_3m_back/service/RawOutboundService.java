package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.RawOutbound.RawOutboundEligibleItemDto;
import com.mini_mes_3m_back.dto.RawOutbound.RawOutboundRegisterRequestDto;
import com.mini_mes_3m_back.dto.RawOutbound.RawOutboundResponseDto;
import com.mini_mes_3m_back.entity.Inventory;
import com.mini_mes_3m_back.entity.RawOutbound;
import com.mini_mes_3m_back.entity.RawsItem;
import com.mini_mes_3m_back.repository.InventoryRepository;
import com.mini_mes_3m_back.repository.RawOutboundRepository;
import com.mini_mes_3m_back.repository.RawsItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RawOutboundService {

    private final RawsItemRepository rawsItemRepository;
    private final RawOutboundRepository rawOutboundRepository;
    private final InventoryRepository inventoryRepository;

    public RawOutboundService(RawsItemRepository rawsItemRepository, RawOutboundRepository rawOutboundRepository, InventoryRepository inventoryRepository) {
        this.rawsItemRepository = rawsItemRepository;
        this.rawOutboundRepository = rawOutboundRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // --- 1. 출고 등록 가능한 원자재 품목 목록 조회 ---
    @Transactional(readOnly = true)
    public List<RawOutboundEligibleItemDto> getOutboundEligibleRawsItems(String keyword) {
        List<Inventory> inventories = inventoryRepository.searchActiveInventories(keyword);

        return inventories.stream()
                .filter(i -> i.getRawItem() != null && i.getRawItem().getSupplier() != null && i.getRawItem().getSupplier().getActive())
                .map(i -> new RawOutboundEligibleItemDto(
                        i.getRawItem().getRawsItemId(),
                        i.getInventoryId(),
                        i.getRawItem().getSupplier().getName(),
                        i.getRawItem().getItemCode(),
                        i.getRawItem().getItemName(),
                        i.getRawItem().getSpec(),
                        i.getRawItem().getManufacturer(),
                        i.getQty(), // 현재 재고량
                        // RawsItem의 unit 필드가 있다면 사용하거나 spec에서 파싱
                        // i.getRawItem().getUnit() 또는 i.getRawItem().getSpec().split("/").length > 1 ? i.getRawItem().getSpec().split("/")[1].trim() : null
                        null // TODO: RawsItem에 단위 필드를 추가하는 것이 더 명확
                ))
                .collect(Collectors.toList());
    }

    // --- 2. 원자재 품목 출고 등록 ---
    @Transactional
    public RawOutboundResponseDto registerRawOutbound(RawOutboundRegisterRequestDto request) {
        RawsItem rawsItem = rawsItemRepository.findById(request.getRawsItemId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 원자재 품목입니다. ID: " + request.getRawsItemId()));

        Inventory inventory = inventoryRepository.findByRawItem(rawsItem)
                .orElseThrow(() -> new IllegalArgumentException("해당 원자재의 재고 정보가 없습니다. ID: " + request.getRawsItemId()));

        // 출고 수량이 현재 재고량보다 많은지 확인
        if (request.getQty() > inventory.getQty()) {
            throw new IllegalArgumentException("출고 수량이 현재 재고량(" + inventory.getQty() + ")보다 많습니다.");
        }

        // 출고 번호 생성 (MOUT-yyyyMMdd-001)
        String rawOutboundNum = generateRawOutboundNum(request.getOutboundDate()); // request.getOutboundDate() 대신 request.getShippedAt()

        RawOutbound rawOutbound = RawOutbound.builder()
                .rawsItem(rawsItem)
                .qty(request.getQty())
                .shippedAt(request.getOutboundDate())
                .rawOutboundMOUTNum(rawOutboundNum) // rawOutboundNum 대신 rawOutboundMOUTNum
                // isCancelled 필드 제거
                .build();

        RawOutbound savedOutbound = rawOutboundRepository.save(rawOutbound);

        // --- 재고 업데이트 (Inventory 엔티티 qty 차감) ---
        inventory.setQty(inventory.getQty() - request.getQty());
        inventoryRepository.save(inventory);

        return new RawOutboundResponseDto(
                savedOutbound.getRawOutboundId(),
                savedOutbound.getRawOutboundMOUTNum(), // rawOutboundNum 대신 rawOutboundMOUTNum
                savedOutbound.getRawsItem().getRawsItemId(), // rawItem 대신 getRawItem()
                savedOutbound.getRawsItem().getItemName(),
                savedOutbound.getQty(),
                savedOutbound.getShippedAt(), // outboundDate 대신 shippedAt
                savedOutbound.getCreatedAt()
        );
    }

    // --- 출고 번호 자동 부여 헬퍼 메서드 ---
    private String generateRawOutboundNum(LocalDate shippedAt) { // outboundDate 대신 shippedAt
        String datePrefix = shippedAt.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "MOUT-" + datePrefix + "-";
        long count = rawOutboundRepository.countByRawOutboundMOUTNumStartingWith(prefix); // rawOutboundNum 대신 rawOutboundMOUTNum
        return prefix + String.format("%03d", count + 1);
    }
}