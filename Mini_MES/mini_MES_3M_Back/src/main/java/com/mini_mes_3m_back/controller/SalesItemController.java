package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.*;
import com.mini_mes_3m_back.service.SalesItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sales-items")
public class SalesItemController {

    private final SalesItemService salesItemService;

    // 등록
    @PostMapping
    public ResponseEntity<SalesItemRegisterDto> createSalesItem(@RequestBody SalesItemRegisterDto dto) {
        return ResponseEntity.ok(salesItemService.createSalesItem(dto));
    }

    // 목록조회 (검색: 거래처명/품목명/품목번호)
    @GetMapping
    public ResponseEntity<Page<SalesItemDetailViewDto>> getSalesItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(salesItemService.getSalesItems(keyword, pageable));
    }

    // 상세조회
    @GetMapping("/{id}")
    public ResponseEntity<SalesItemDetailViewDto> getSalesItemDetail(@PathVariable Long id) {
        return ResponseEntity.ok(salesItemService.getSalesItemDetail(id));
    }

    // 수정 (상세 페이지에서만 사용)
    @PutMapping("/{id}")
    public ResponseEntity<SalesItemRegisterDto> updateSalesItem(
            @PathVariable Long id,
            @RequestBody SalesItemRegisterDto dto) {
        return ResponseEntity.ok(salesItemService.updateSalesItem(id, dto));
    }

    // 거래상태 토글 — 반환: 업데이트된 상세 DTO
    @PutMapping("/{id}/toggle")
    public ResponseEntity<SalesItemDetailViewDto> toggleTradeStatus(@PathVariable Long id) {
        SalesItemDetailViewDto updated = salesItemService.toggleTradeStatus(id);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SalesItemRegisterDto> createSalesItem(
            @RequestPart("data") SalesItemRegisterDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        SalesItemRegisterDto result = salesItemService.createSalesItemWithImage(dto, file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SalesItemSearchDto>> getAllSalesItems() {
        List<SalesItemSearchDto> items = salesItemService.getAllSalesItemsForSearch();
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{salesItemId}/active")
    public ResponseEntity<Void> updateActive(
            @PathVariable Long salesItemId,
            @RequestBody SalesItemUpdateStatusRequestDto requestDto) {
        salesItemService.updateSalesItemActive(salesItemId, requestDto.getActive());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{salesItemId}")
    public ResponseEntity<SalesItemDetailDto> getSalesItemDetail(@PathVariable Long salesItemId) {
        SalesItemDetailDto detail = salesItemService.getSalesItemDetail(salesItemId);
        return ResponseEntity.ok(detail);
    }
}
