package com.mini_mes_3m_back.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class RawInboundDto {
    private Long item_id;           // 품목 ID
    private Integer qty;            // 입고 수량
    private OffsetDateTime inb_date; // 입고 일자
    private OffsetDateTime mfg_date; // 제조 일자

}
