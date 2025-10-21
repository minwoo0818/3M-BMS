package com.mini_mes_3m_back.dto.Partner;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 수주품목 등록에서 거래처 선택용 DTO (ID + 이름만)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartnerSelectResponseDto {
    private Long partnerId;  // 거래처 ID
    private String name;     // 거래처명
}
