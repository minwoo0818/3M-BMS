// src/main/java/com/mini_mes_3m_back/dto/Partner/PartnerDetailUpdateRequestDto.java // 새로운 DTO 이름!
package com.mini_mes_3m_back.dto.Partner;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

// 이 DTO는 거래처 상세 정보 '수정' 요청의 바디에 사용됩니다. partnerId 제외!
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartnerDetailUpdateRequestDto {
    // private Long partnerId; // <-- 수정 요청 바디에서는 partnerId 제외! PathVariable로만 받음

    @NotBlank(message = "업체 유형은 필수 입력 항목입니다.")
    private String partnerType;

    @NotBlank(message = "사업자 등록번호는 필수 입력 항목입니다.")
//    @Pattern(regexp = "^[0-9]{3}-[0-9]{2}-[0-9]{5}$", message = "사업자 등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)")
    private String brNum;

    @NotBlank(message = "업체명은 필수 입력 항목입니다.")
    private String name;

//    @NotBlank(message = "대표명은 필수 입력 항목입니다.")
    private String bossName;

//    @NotBlank(message = "대표 전화번호는 필수 입력 항목입니다.")
    private String bossPhone;

//    @NotBlank(message = "기업 주소는 필수 입력 항목입니다.")
    private String address;

//    @NotBlank(message = "담당자명은 필수 입력 항목입니다.")
    private String representativeName;

//    @NotBlank(message = "담당자 전화번호는 필수 입력 항목입니다.")
    private String representativePhone;

    private String representativeEmail;
    private String remark;

    @NotNull(message = "거래 상태는 필수 입력 항목입니다.")
    private Boolean active;
}