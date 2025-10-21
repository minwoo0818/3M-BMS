package com.mini_mes_3m_back.dto.SalesItemInbound;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesItemInboundListResponseDto {
    private Long salesItemId; // 수주 품목 ID (PK)
    private Long partnerId; // 거래처 ID
    private String partnerName; // 거래처명
    private String itemCode; // 품목 번호
    private String itemName; // 품목명
    private String classification; // 분류
    private String remark; // 비고
}