package com.mini_mes_3m_back.dto.SalesOutbound;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class SalesOutboundRegDto {
    private Long inboundId;           // 출고 대상 입고 항목 ID
    private Integer qty;              // 출고 수량

        @JsonFormat(pattern = "yyyy-MM-dd") // 날짜만 받도록 설정
        private LocalDate shippedAt;

//    private Boolean status;           // 출고 상태 (true, false)
}
