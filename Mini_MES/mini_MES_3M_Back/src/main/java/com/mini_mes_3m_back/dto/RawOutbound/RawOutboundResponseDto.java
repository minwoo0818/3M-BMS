package com.mini_mes_3m_back.dto.RawOutbound;

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
public class RawOutboundResponseDto {
    private Long rawOutboundId;
    private String rawOutboundMOUTNum;
    private Long rawsItemId;
    private String rawsItemName;
    private Integer qty;
    private LocalDate outboundDate;
    private OffsetDateTime createdAt;
}