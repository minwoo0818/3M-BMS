package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.Inventory.RawItemInventoryResponseDto;
import com.mini_mes_3m_back.entity.Inventory;
import com.mini_mes_3m_back.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository)
    {
        this.inventoryRepository = inventoryRepository;
    }

    // --- 원자재 재고 현황 조회 ---
    @Transactional(readOnly = true)
    public List<RawItemInventoryResponseDto> getRawItemInventoryStatus(String keyword) {
        List<Inventory> inventories = inventoryRepository.searchActiveInventories(keyword);

        return inventories.stream()
                .filter(i -> i.getRawItem() != null && i.getRawItem().getSupplier() != null && i.getRawItem().getSupplier().getActive()) // 방어적 코드
                .map(i -> new RawItemInventoryResponseDto(
                        i.getInventoryId(),
                        i.getRawItem().getRawsItemId(),
                        i.getRawItem().getSupplier().getName(),
                        i.getRawItem().getItemCode(),
                        i.getRawItem().getItemName(),
                        i.getRawItem().getSpec(),
                        i.getRawItem().getManufacturer(),
                        i.getQty(), // 현재 재고량
                        null // RawsItem에 단위 필드가 명확하다면 i.getRawItem().getUnit() 사용
                ))
                .collect(Collectors.toList());
    }
}