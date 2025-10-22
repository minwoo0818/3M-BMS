package com.mini_mes_3m_back.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesItemUpdateStatusRequestDto {
    @NotNull(message = "거래 상태 값은 필수입니다.")
    private Boolean active; // 변경할 거래 상태
}
