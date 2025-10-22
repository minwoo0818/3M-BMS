package com.mini_mes_3m_back.dto.RawItemInbound;

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
public class RawInboundResponseDto {
    private Long rawInboundId;
    private String rawInboundNum; // 자동 부여된 입고 번호
    private Long rawsItemId; // 입고된 RawsItem ID
    private String rawsItemName; // 입고된 RawsItem 이름
    private Integer qty; // 입고 수량
    private LocalDate inboundDate; // 입고 일자
    private LocalDate manufacturingDate; // 제조 일자
    private OffsetDateTime createdAt;
}