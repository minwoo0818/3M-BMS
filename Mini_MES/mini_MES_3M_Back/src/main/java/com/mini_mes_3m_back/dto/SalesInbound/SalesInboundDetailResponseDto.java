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
public class SalesInboundDetailResponseDto {
    private Long inboundId; // 입고 고유 ID
    private Long salesItemId; // 수주 품목 ID
    private String customerName; // 거래처명
    private String itemCode; // 품목 번호
    private String itemName; // 품목명
    private String classification; // 분류
    private String unit; // 품목 단위 (SalesItem 엔티티에 있음)
    private Integer price; // 품목 가격 (SalesItem 엔티티에 있음)
    private String color; // 품목 색상 (SalesItem 엔티티에 있음)
    private String coatingMethod; // 품목 도장 방법 (SalesItem 엔티티에 있음)
    private String inboundLOTNum; // 입고 LOT 번호
    private Integer qty; // 입고 수량
    private LocalDate receivedAt; // 입고 일자
    private String remark; // SalesItem의 비고 (품목 비고)
    private Boolean isCancelled; // 입고 취소 여부
    private Boolean isOutboundProcessed; // 출고 처리 여부 (출고 시퀀스 중 사용)
    private OffsetDateTime createdAt; // 입고 등록일시
    private OffsetDateTime updatedAt; // 입고 수정일시 (SalesInbound 엔티티에 있음)
}