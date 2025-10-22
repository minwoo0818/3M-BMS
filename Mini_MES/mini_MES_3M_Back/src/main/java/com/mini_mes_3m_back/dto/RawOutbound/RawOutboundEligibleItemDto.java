package com.mini_mes_3m_back.dto.RawOutbound;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RawOutboundEligibleItemDto {
    private Long rawsItemId;
    private Long inventoryId;
    private String supplierName;
    private String itemCode;
    private String itemName;
    private String spec;
    private String manufacturer;
    private Integer currentStock;
    private String unit;
}