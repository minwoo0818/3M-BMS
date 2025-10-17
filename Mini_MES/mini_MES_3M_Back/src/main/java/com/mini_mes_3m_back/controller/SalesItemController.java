package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.SalesItemRegisterDto;
import com.mini_mes_3m_back.dto.SalesItemSearchDto;
import com.mini_mes_3m_back.entity.Operations;
import com.mini_mes_3m_back.service.SalesItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales-items")
@RequiredArgsConstructor
public class SalesItemController {

    private final SalesItemService salesItemService;

    // ==============================
    // 1️⃣ 수주품목 등록
    // ==============================
    @PostMapping
    public ResponseEntity<SalesItemRegisterDto> createSalesItem(@RequestBody SalesItemRegisterDto dto) {
        SalesItemRegisterDto saved = salesItemService.createSalesItem(dto);
        return ResponseEntity.ok(saved);
    }

    // ==============================
    // 2️⃣ 전체 조회 (조회용 DTO)
    // ==============================
    @GetMapping
    public ResponseEntity<List<SalesItemSearchDto>> getAllSalesItems() {
        List<SalesItemSearchDto> list = salesItemService.getAllSalesItemsForSearch();
        return ResponseEntity.ok(list);
    }

    // ==============================
    // 3️⃣ 이름 검색 (조회용 DTO)
    // ==============================
    @GetMapping("/search")
    public ResponseEntity<List<SalesItemSearchDto>> searchSalesItems(@RequestParam String itemName) {
        List<SalesItemSearchDto> list = salesItemService.searchSalesItemsByName(itemName);
        return ResponseEntity.ok(list);
    }

    // ==============================
    // 4️⃣ 공정 검색
    // ==============================
    @GetMapping("/operations/search")
    public ResponseEntity<List<Operations>> searchOperations(@RequestParam String keyword) {
        return ResponseEntity.ok(salesItemService.searchOperations(keyword));
    }

    // ==============================
    // 5️⃣ 거래 상태 변경
    // ==============================
    @PatchMapping("/{id}/resume")
    public ResponseEntity<Void> resumeTrade(@PathVariable Long id) {
        salesItemService.resumeTrade(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/stop")
    public ResponseEntity<Void> stopTrade(@PathVariable Long id) {
        salesItemService.stopTrade(id);
        return ResponseEntity.ok().build();
    }
}
