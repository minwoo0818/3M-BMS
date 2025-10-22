package com.mini_mes_3m_back.dto.RawOutbound;

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
public class RawOutboundRegisterRequestDto {
    @NotNull(message = "원자재 품목 ID는 필수입니다.")
    private Long rawsItemId;

    @NotNull(message = "출고 수량은 필수입니다.")
    @Min(value = 1, message = "출고 수량은 1개 이상이어야 합니다.")
    private Integer qty;

    @NotNull(message = "출고 일자는 필수입니다.")
    private LocalDate outboundDate;
}