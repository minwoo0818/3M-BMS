// src/main/java/com/mini_mes_3m_back/dto/RawsItem/RawsItemDetailResponseDto.java (새로 생성!)
package com.mini_mes_3m_back.dto.RawsItem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RawsItemDetailResponseDto {
    @NotNull
    private Long rawsItemId; // 원자재 품목 고유 ID (PK)

    @NotBlank(message = "품목번호는 필수 입력 항목입니다.")
    private String itemCode;

    @NotBlank(message = "품목명은 필수 입력 항목입니다.")
    private String itemName;

    @NotBlank(message = "분류는 필수 입력 항목입니다.")
    private String classification;

    private String color; // 색상

    @NotBlank(message = "원자재 규격은 필수 입력 항목입니다.")
    private String spec; // 원자재 규격 (양/단위)

    @NotBlank(message = "제조사는 필수 입력 항목입니다.")
    private String manufacturer;

    private String remark; // 비고

    @NotNull(message = "매입처 ID는 필수 입력 항목입니다.")
    private Long supplierId; // 매입처의 ID (Partner 엔티티의 PK)

    @NotBlank(message = "매입처명은 필수 입력 항목입니다.")
    private String supplierName; // 매입처명 (Partner의 name)

    @NotNull(message = "거래 상태는 필수 입력 항목입니다.")
    private Boolean active; // 활성화 여부
}