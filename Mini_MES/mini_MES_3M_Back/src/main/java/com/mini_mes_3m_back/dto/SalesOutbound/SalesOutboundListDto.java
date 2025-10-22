package com.mini_mes_3m_back.dto.SalesOutbound;

import com.mini_mes_3m_back.entity.SalesInbound;
import com.mini_mes_3m_back.entity.SalesOutbound;
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
public class SalesOutboundListDto {
    private Long inboundId;             // 출고 대상 입고 항목 ID
    private String inboundLOTNum;       // LOT 넘버
    private String partnerName;         // 거래처명
    private String itemCode;            // 품목 번호
    private String itemName;            // 품목명
    private LocalDate receivedAt;       // 입고일자
    private Integer qty;                // 입고수량
    private String classification;      // 분류
    private Boolean isOutboundDone;     // 출고 여부


    // 조회용 변환: SalesInbound만 받아서 DTO로 변환
    public static SalesOutboundListDto fromInbound(SalesInbound inbound) {
        return SalesOutboundListDto.builder()
                .inboundId(inbound.getInboundId())
                .inboundLOTNum(inbound.getInboundLOTNum())
                .partnerName(inbound.getItem().getPartnerName())
                .itemCode(inbound.getItem().getItemCode())
                .itemName(inbound.getItem().getItemName())
                .receivedAt(inbound.getReceivedAt())
                .qty(inbound.getQty())
                .classification(inbound.getItem().getClassification())
                .isOutboundDone(inbound.getIsOutboundProcessed())

                .build();
    }

    // 확장용 변환: SalesInbound + SalesOutbound 함께 받아서 DTO로 변환
    public static SalesOutboundListDto fromInbound(SalesInbound inbound, SalesOutbound outbound) {
        return SalesOutboundListDto.builder()
                .inboundId(inbound.getInboundId())
                .inboundLOTNum(inbound.getInboundLOTNum())
                .partnerName(inbound.getItem().getPartnerName())
                .itemCode(inbound.getItem().getItemCode())
                .itemName(inbound.getItem().getItemName())
                .receivedAt(inbound.getReceivedAt())
                .qty(inbound.getQty())
                .classification(inbound.getItem().getClassification())
                .isOutboundDone(outbound != null)

                .build();
    }
}