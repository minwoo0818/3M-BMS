// src/main/java/com/mini_mes_3m_back/dto/RawsItem/RawsItemPartialResponseDto.java (새로 생성!)
package com.mini_mes_3m_back.dto.RawsItem;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RawsItemPartialResponseDto {
    private Long rawsItemId; // 원자재 품목 고유 ID
    private String itemCode; // 품목번호
    private String itemName; // 품목명
    private String classification; // 분류
    private String supplierName; // 매입처명 (Partner의 name)
    private String manufacturer; // 제조사
    private Boolean active; // 활성화 여부
}