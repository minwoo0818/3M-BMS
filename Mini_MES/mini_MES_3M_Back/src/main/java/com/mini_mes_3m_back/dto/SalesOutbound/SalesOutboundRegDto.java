package com.mini_mes_3m_back.dto.SalesOutbound;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class SalesOutboundRegDto {
    private Long inboundId;           // 출고 대상 입고 항목 ID
    private Integer qty;              // 출고 수량
    private OffsetDateTime shippedAt; // 출고 일자
//    private Boolean status;           // 출고 상태 (true, false)
}
