package com.mini_mes_3m_back.dto.SalesInbound;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesInboundHistoryResponseDto {
    private Long inboundId; // 입고 고유 ID
    private Long salesItemId; // 수주 품목 ID
    private String customerName; // 거래처명 (Partner의 name)
    private String itemCode; // 품목 번호
    private String itemName; // 품목명
    private String classification; // 분류
    private String inboundLOTNum; // 입고 LOT 번호
    private Integer qty; // 입고 수량
    private LocalDate receivedAt; // 입고 일자
    private String remark; // SalesItem의 비고
    private Boolean isCancelled; // 입고 취소 여부
    private OffsetDateTime createdAt; // 입고 등록일시
}