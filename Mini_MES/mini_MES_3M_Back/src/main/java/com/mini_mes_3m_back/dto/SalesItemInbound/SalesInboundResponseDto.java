package com.mini_mes_3m_back.dto.SalesItemInbound;

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
public class SalesInboundResponseDto {
    private Long inboundId; // 입고 ID (미누 엔티티에 맞춰 변경!)
    private Long salesItemId; // 입고된 SalesItem ID
    private String salesItemName; // 입고된 SalesItem 이름
    private Integer qty; // 입고 수량 (미누 엔티티에 맞춰 변경!)
    private LocalDate receivedAt; // 입고 일자 (미누 엔티티에 맞춰 변경!)
    private String inboundLOTNum; // LOT 번호 (미누 엔티티에 맞춰 변경!)
    private OffsetDateTime createdAt;
}