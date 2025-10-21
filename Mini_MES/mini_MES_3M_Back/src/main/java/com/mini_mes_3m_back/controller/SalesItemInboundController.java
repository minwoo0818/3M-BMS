package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundDetailResponseDto;
import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundHistoryResponseDto;
import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundUpdateRequestDto;
import com.mini_mes_3m_back.dto.SalesItemInbound.SalesInboundRegisterRequestDto;
import com.mini_mes_3m_back.dto.SalesItemInbound.SalesInboundResponseDto;
import com.mini_mes_3m_back.dto.SalesItemInbound.SalesItemInboundListResponseDto;
import com.mini_mes_3m_back.service.SalesItemInboundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales-inbound")
public class SalesItemInboundController {

    private final SalesItemInboundService salesItemInboundService;

    public SalesItemInboundController(SalesItemInboundService salesItemInboundService) {
        this.salesItemInboundService = salesItemInboundService;
    }

    // --- 1. 수주대상 품목 목록 조회 (입고 등록용) ---
    @GetMapping("/eligible-items")
    public ResponseEntity<List<SalesItemInboundListResponseDto>> getInboundEligibleSalesItems(
            @RequestParam(required = false) String keyword) {
        try {
            List<SalesItemInboundListResponseDto> items = salesItemInboundService.getInboundEligibleSalesItems(keyword);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 2. 수주대상 품목 입고 등록 ---
    @PostMapping
    public ResponseEntity<SalesInboundResponseDto> registerSalesInbound(
            @Valid @RequestBody SalesInboundRegisterRequestDto request) {
        try {
            SalesInboundResponseDto response = salesItemInboundService.registerSalesInbound(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // --- 3. 입고 이력 목록 조회 ---
    @GetMapping("/history") // 입고 이력 조회를 위한 새로운 엔드포인트
    public ResponseEntity<List<SalesInboundHistoryResponseDto>> getSalesInboundHistory(
            @RequestParam(required = false) String keyword) {
        try {
            List<SalesInboundHistoryResponseDto> history = salesItemInboundService.getSalesInboundHistory(keyword);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 4. 입고 이력 상세 조회 --- (선택사항, 필요시 사용)
    @GetMapping("/history/{inboundId}/detail")
    public ResponseEntity<SalesInboundDetailResponseDto> getSalesInboundDetail(@PathVariable Long inboundId) {
        try {
            SalesInboundDetailResponseDto detail = salesItemInboundService.getSalesInboundDetail(inboundId);
            return ResponseEntity.ok(detail);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 5. 입고 이력 수정 ---
    @PutMapping("/history/{inboundId}")
    public ResponseEntity<SalesInboundDetailResponseDto> updateSalesInbound(
            @PathVariable Long inboundId,
            @Valid @RequestBody SalesInboundUpdateRequestDto request) {
        try {
            SalesInboundDetailResponseDto updated = salesItemInboundService.updateSalesInbound(inboundId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 6. 입고 이력 삭제 (취소) ---
    // 실제 삭제 대신 isCancelled 플래그를 true로 변경
    @PatchMapping("/history/{inboundId}/cancel") // PATCH 사용: 부분 업데이트 (취소 상태 변경)
    public ResponseEntity<Void> cancelSalesInbound(@PathVariable Long inboundId) {
        try {
            salesItemInboundService.cancelSalesInbound(inboundId);
            return ResponseEntity.noContent().build(); // 204 No Content (성공적으로 처리되었지만 반환할 데이터 없음)
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}