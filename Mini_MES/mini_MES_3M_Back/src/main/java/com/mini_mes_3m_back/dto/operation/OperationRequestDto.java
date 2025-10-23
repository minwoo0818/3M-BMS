package com.mini_mes_3m_back.dto.operation;

import com.mini_mes_3m_back.entity.Operations;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OperationRequestDto {

    @NotBlank(message = "공정 코드는 필수 입력 항목입니다.")
    private String code;

    @NotBlank(message = "공정명은 필수 입력 항목입니다.")
    private String name;

    private String description;

    @NotNull(message = "소요 시간은 필수 입력 항목입니다.")
    // ⭐️ 소요 시간은 필수 항목이며, 0 또는 양수여야 함
    // '시간' 필드가 null이거나 입력되지 않았을 때 에러 처리
    @PositiveOrZero(message = "소요 시간은 0 또는 양수만 입력 가능합니다.")
    private Integer standardTime;

    // ⭐️ 상태 필드 추가 (선택적으로 입력 가능)
    private Operations.OperationStatus status;

}
