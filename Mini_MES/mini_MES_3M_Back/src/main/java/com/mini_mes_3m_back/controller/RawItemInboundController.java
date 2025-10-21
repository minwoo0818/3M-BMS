package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.RawItemInbound.RawInboundRegisterRequestDto;
import com.mini_mes_3m_back.dto.RawItemInbound.RawInboundResponseDto;
import com.mini_mes_3m_back.dto.RawItemInbound.RawItemInboundEligibleItemDto;
import com.mini_mes_3m_back.service.RawItemInboundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raw-inbound") // 원자재 입고 관련 API는 /api/raw-inbound 경로로 매핑
public class RawItemInboundController {

    private final RawItemInboundService rawItemInboundService;

    public RawItemInboundController(RawItemInboundService rawItemInboundService) {
        this.rawItemInboundService = rawItemInboundService;
    }

    // --- 1. 원자재 품목 목록 조회 (입고 등록용) ---
    // 조건: 기존 원자재 품목 중 거래 종료된 품목 및 업체는 조회 불가
    // 검색 가능: 매입처명, 품목 번호, 품목명, 제조사
    @GetMapping("/eligible-items")
    public ResponseEntity<List<RawItemInboundEligibleItemDto>> getInboundEligibleRawsItems(
            @RequestParam(required = false) String keyword) {
        try {
            List<RawItemInboundEligibleItemDto> items = rawItemInboundService.getInboundEligibleRawsItems(keyword);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 2. 원자재 품목 입고 등록 ---
    // 원자재 품목 선택, 입고 수량, 입고 일자, 제조 일자 입력 후 등록 (입고 번호 자동 부여)
    @PostMapping
    public ResponseEntity<RawInboundResponseDto> registerRawInbound(
            @Valid @RequestBody RawInboundRegisterRequestDto request) {
        try {
            RawInboundResponseDto response = rawItemInboundService.registerRawInbound(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response); // 201 Created
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // 400 Bad Request
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}