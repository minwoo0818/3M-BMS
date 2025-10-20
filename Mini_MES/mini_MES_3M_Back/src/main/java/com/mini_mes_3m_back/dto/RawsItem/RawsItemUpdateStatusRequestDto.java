// src/main/java/com/mini_mes_3m_back/dto/RawsItem/RawsItemUpdateStatusRequestDto.java (새로 생성!)
package com.mini_mes_3m_back.dto.RawsItem;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RawsItemUpdateStatusRequestDto {
    @NotNull(message = "거래 상태 값은 필수입니다.")
    private Boolean active; // 변경할 활성화 상태
}