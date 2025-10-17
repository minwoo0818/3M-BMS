
package com.mini_mes_3m_back.dto.Partner;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotNull; // 필수가 아니면 @NotNull 빼도 됨

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartnerUpdateStatusRequestDto {
    @NotNull(message = "거래 상태 값은 필수입니다.") // active 필드 값이 꼭 전달되어야 함을 명시
    private Boolean active; // 변경할 거래 상태 (true or false)
}