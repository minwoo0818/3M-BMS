package com.mini_mes_3m_back.controller;


import com.mini_mes_3m_back.dto.SalesHistoryOutboundDto.SalesHistoryOutboundDto;
import com.mini_mes_3m_back.service.SalesHistoryOutboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("order/history/outbound")
@RequiredArgsConstructor
public class SalesHistoryOutboundController {

    private final SalesHistoryOutboundService outboundService;

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
}
