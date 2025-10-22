package com.mini_mes_3m_back.dto.RawItemInbound;

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
public class RawInboundRegisterRequestDto {
    @NotNull(message = "원자재 품목 ID는 필수입니다.")
    private Long rawsItemId; // 입고 대상 RawsItem의 ID

    @NotNull(message = "입고 수량은 필수입니다.")
    @Min(value = 1, message = "입고 수량은 1개 이상이어야 합니다.")
    private Integer qty; // 입고 수량

    @NotNull(message = "입고 일자는 필수입니다.")
    private LocalDate inboundDate; // 입고 일자

    @NotNull(message = "제조 일자는 필수입니다.")
    private LocalDate manufacturingDate; // 제조 일자
}