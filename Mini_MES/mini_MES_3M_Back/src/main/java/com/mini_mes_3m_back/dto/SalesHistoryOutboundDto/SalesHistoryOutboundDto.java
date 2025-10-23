package com.mini_mes_3m_back.dto.SalesHistoryOutboundDto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class SalesHistoryOutboundDto {

    private Long outboundId;
    private String outboundOUTNum;
    private String partnerName;
    private String itemCode;
    private String itemName;
    private Integer qty;
    @JsonFormat(pattern = "yyyy-MM-dd") // 날짜만 받도록 설정
    private LocalDate shippedAt;
    private OffsetDateTime createdAt;
    private Boolean isCancelled;
    private String classification;     // 분류
}
