// src/main/java/com/mini_mes_3m_back/controller/RawsItemController.java (새로 생성!)
package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.RawsItem.*;
import com.mini_mes_3m_back.service.RawsItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raws-items")
public class RawsItemController {

    private final RawsItemService rawsItemService;

    public RawsItemController(RawsItemService rawsItemService) {
        this.rawsItemService = rawsItemService;
    }

    // --- 1. 원자재 품목 등록 ---
    @PostMapping
    public ResponseEntity<RawsItemDetailResponseDto> registerRawsItem(
            @Valid @RequestBody RawsItemRegisterRequestDto request) {
        try {
            RawsItemDetailResponseDto registeredItem = rawsItemService.registerRawsItem(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredItem); // 201 Created
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // 400 Bad Request
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 2. 원자재 품목 목록 조회 ---
    @GetMapping
    public ResponseEntity<List<RawsItemPartialResponseDto>> getAllRawsItems() {
        try {
            List<RawsItemPartialResponseDto> rawsItems = rawsItemService.getAllRawsItems();
            return ResponseEntity.ok(rawsItems);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 3. 원자재 품목 상세 조회 ---
    @GetMapping("/{rawsItemId}/detail")
    public ResponseEntity<RawsItemDetailResponseDto> getRawsItemDetailById(@PathVariable Long rawsItemId) {
        try {
            RawsItemDetailResponseDto rawsItem = rawsItemService.getRawsItemDetailById(rawsItemId);
            return ResponseEntity.ok(rawsItem);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 4. 원자재 품목 정보 수정 ---
    @PutMapping("/{rawsItemId}")
    public ResponseEntity<RawsItemDetailResponseDto> updateRawsItem(
            @PathVariable Long rawsItemId,
            @Valid @RequestBody RawsItemUpdateRequestDto request) {
        try {
            RawsItemDetailResponseDto updatedItem = rawsItemService.updateRawsItem(rawsItemId, request);
            return ResponseEntity.ok(updatedItem);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 5. 원자재 품목 활성 상태 토글 ---
    @PatchMapping("/{rawsItemId}/status")
    public ResponseEntity<RawsItemPartialResponseDto> updateRawsItemStatus(
            @PathVariable Long rawsItemId,
            @Valid @RequestBody RawsItemUpdateStatusRequestDto request) {
        try {
            RawsItemPartialResponseDto updatedItem = rawsItemService.updateRawsItemStatus(rawsItemId, request.getActive());
            return ResponseEntity.ok(updatedItem);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}