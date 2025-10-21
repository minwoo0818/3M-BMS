package com.mini_mes_3m_back.controller;

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
}