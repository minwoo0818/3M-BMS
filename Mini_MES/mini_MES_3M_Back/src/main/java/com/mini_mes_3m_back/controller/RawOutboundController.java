package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.RawOutbound.RawOutboundEligibleItemDto;
import com.mini_mes_3m_back.dto.RawOutbound.RawOutboundRegisterRequestDto;
import com.mini_mes_3m_back.dto.RawOutbound.RawOutboundResponseDto;
import com.mini_mes_3m_back.service.RawOutboundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/raw-outbound")
public class RawOutboundController {

    private final RawOutboundService rawOutboundService;

    public RawOutboundController(RawOutboundService rawOutboundService) {
        this.rawOutboundService = rawOutboundService;
    }

    // --- 1. 출고 등록 가능한 원자재 품목 목록 조회 ---
    @GetMapping("/eligible-items")
    public ResponseEntity<List<RawOutboundEligibleItemDto>> getOutboundEligibleRawsItems(
            @RequestParam(required = false) String keyword) {
        try {
            List<RawOutboundEligibleItemDto> items = rawOutboundService.getOutboundEligibleRawsItems(keyword);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- 2. 원자재 품목 출고 등록 ---
    @PostMapping
    public ResponseEntity<RawOutboundResponseDto> registerRawOutbound(
            @Valid @RequestBody RawOutboundRegisterRequestDto request) {
        try {
            RawOutboundResponseDto response = rawOutboundService.registerRawOutbound(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}