package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.SalesOutbound.SalesOutboundListDto;
import com.mini_mes_3m_back.dto.SalesOutbound.SalesOutboundRegDto;
import com.mini_mes_3m_back.service.SalesOutboundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order/outbound/list")
@RequiredArgsConstructor
public class SalesOutboundController {

    private final SalesOutboundService salesOutboundService;

    //1. 출고등록
    @PostMapping("/register")
    public ResponseEntity<?> registerOutbound(@Valid @RequestBody SalesOutboundRegDto salesOutboundRegDto)
    {
        salesOutboundService.registerNewSalesOutbound(salesOutboundRegDto);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("출고가 성공적으로 등록되었습니다.");
        }

    // 출고 대상 입고 리스트 조회
    @GetMapping
    public ResponseEntity<Page<SalesOutboundListDto>> getInboundList(
            @RequestParam int page,
            @RequestParam int limit,
            @RequestParam String searchType,
            @RequestParam String searchTerm
    ) {
        Page<SalesOutboundListDto> result = salesOutboundService.getSalesInboundList(page, limit, searchType, searchTerm);
        return ResponseEntity.ok(result);
    }

}



