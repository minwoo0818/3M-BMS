package com.mini_mes_3m_back.dto.SalesItemInbound;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesInboundRegisterRequestDto {
    @NotNull(message = "수주 품목 ID는 필수입니다.")
    private Long salesItemId; // 입고 대상 SalesItem의 ID

    @NotNull(message = "입고 수량은 필수입니다.")
    @Min(value = 1, message = "입고 수량은 1개 이상이어야 합니다.")
    private Integer qty; // 입고 수량 (미누 엔티티에 맞춰 변경!)

    @NotNull(message = "입고 일자는 필수입니다.")
    private LocalDate receivedAt; // 입고 일자 (미누 엔티티에 맞춰 변경!)
}