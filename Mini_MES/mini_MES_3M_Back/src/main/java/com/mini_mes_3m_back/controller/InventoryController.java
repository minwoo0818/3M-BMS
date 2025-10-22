// src/main/java/com/mini_mes_3m_back/controller/InventoryController.java (새로 생성!)
package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.Inventory.RawItemInventoryResponseDto;
import com.mini_mes_3m_back.service.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory") // 재고 관련 API는 /api/inventory 경로로 매핑
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // --- 원자재 재고 현황 조회 ---
    // 검색 가능: 매입처명, 품목 번호, 품목명
    @GetMapping("/raw-items")
    public ResponseEntity<List<RawItemInventoryResponseDto>> getRawItemInventoryStatus(
            @RequestParam(required = false) String keyword) {
        try {
            List<RawItemInventoryResponseDto> inventoryStatus = inventoryService.getRawItemInventoryStatus(keyword);
            return ResponseEntity.ok(inventoryStatus);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}