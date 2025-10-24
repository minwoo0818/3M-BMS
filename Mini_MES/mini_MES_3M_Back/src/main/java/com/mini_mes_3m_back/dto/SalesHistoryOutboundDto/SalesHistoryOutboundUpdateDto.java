package com.mini_mes_3m_back.dto.SalesHistoryOutboundDto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SalesHistoryOutboundUpdateDto {
    private Integer qty;
    @JsonFormat(pattern = "yyyy-MM-dd") // 날짜만 받도록 설정
    private LocalDate shippedAt;

}
