package com.mini_mes_3m_back.dto.RawItemInbound;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RawItemInboundEligibleItemDto {
    private Long rawsItemId; // 원자재 품목 ID (PK)
    private Long supplierId; // 매입처 ID
    private String supplierName; // 매입처명
    private String itemCode; // 품목 번호
    private String itemName; // 품목명
    private String spec; // 원자재 규격(양/단위)
    private String manufacturer; // 제조사
    private String remark; // 원자재 품목의 비고 (필요시)
    private String color; // 원자재 품목의 색상 (필요시)
}