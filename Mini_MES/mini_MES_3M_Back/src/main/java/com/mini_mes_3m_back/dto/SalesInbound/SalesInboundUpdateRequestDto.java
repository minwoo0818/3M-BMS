package com.mini_mes_3m_back.dto.SalesInbound;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesInboundUpdateRequestDto {
    @NotNull(message = "입고 수량은 필수입니다.")
    @Min(value = 1, message = "입고 수량은 1개 이상이어야 합니다.")
    private Integer qty; // 수정할 입고 수량

    @NotNull(message = "입고 일자는 필수입니다.")
    private LocalDate receivedAt; // 수정할 입고 일자

    // (LOT 번호는 PK이므로 수정 불가)
    // (SalesItem은 변경 불가하다고 가정, 변경 시 재고 관리 복잡해짐)
    // 기타 필드 (예: SalesItem.remark를 입고 기록에 반영하는 경우) 추가 가능
}