package com.mini_mes_3m_back.dto.Inventory;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RawItemInventoryResponseDto {
    private Long inventoryId; // 재고 고유 ID
    private Long rawsItemId; // 원자재 품목 ID
    private String supplierName; // 매입처명
    private String itemCode; // 품목 번호
    private String itemName; // 품목명
    private String spec; // 원자재 규격
    private String manufacturer; // 제조사
    private Integer currentQty; // 현재 재고량 (qty 필드 사용)
    private String unit; // 단위 (RawsItem.unit 필드가 있다면)
}