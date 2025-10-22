package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.*;
import com.mini_mes_3m_back.service.SalesItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/sales-items")
@RequiredArgsConstructor
public class SalesItemController {

    private final SalesItemService salesItemService;

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
