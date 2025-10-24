package com.mini_mes_3m_back.controller;


import com.mini_mes_3m_back.dto.SalesHistoryOutboundDto.SalesHistoryOutboundDto;
import com.mini_mes_3m_back.dto.SalesHistoryOutboundDto.SalesHistoryOutboundUpdateDto;
import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundDetailResponseDto;
import com.mini_mes_3m_back.dto.SalesInbound.SalesInboundUpdateRequestDto;
import com.mini_mes_3m_back.service.SalesHistoryOutboundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("order/history/outbound")
@RequiredArgsConstructor
public class SalesHistoryOutboundController {

    private final SalesHistoryOutboundService outboundService;
    private final SalesHistoryOutboundService salesHistoryOutboundService;

    /**
     * 전체 출고 이력 조회 또는 키워드 기반 검색
     * GET /order/history/outbound?keyword=...
     * @param keyword 검색 키워드 (선택 사항)
     * @return 출고 이력 DTO 리스트
     */
    @GetMapping
    public ResponseEntity<List<SalesHistoryOutboundDto>> getOutboundHistoryList(
            @RequestParam(required = false, defaultValue = "") String keyword) {

        List<SalesHistoryOutboundDto> outboundHistory = outboundService.searchOutboundHistory(keyword);

        return ResponseEntity.ok(outboundHistory);
    }

    // --- 출고 이력 수정 ---
    @PutMapping("/{outboundId}")
    public ResponseEntity<SalesHistoryOutboundDto> updateSalesOutbound(
            @PathVariable Long outboundId,
            @Valid @RequestBody SalesHistoryOutboundUpdateDto request) {
        try {
            SalesHistoryOutboundDto updated = salesHistoryOutboundService.updateSalesOutbound(outboundId, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 출고 이력 삭제 (취소) ---
    // 실제 삭제 대신 isCancelled 플래그를 true로 변경
    @PatchMapping("/{outboundId}/cancel") // PATCH 사용: 부분 업데이트 (취소 상태 변경)
    public ResponseEntity<Void> cancelSalesOutbound(@PathVariable Long outboundId) {
        try {
            salesHistoryOutboundService.cancelSalesOutbound(outboundId);
            return ResponseEntity.noContent().build(); // 204 No Content (성공적으로 처리되었지만 반환할 데이터 없음)
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
