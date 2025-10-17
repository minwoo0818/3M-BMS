// src/main/java/com/mini_mes_3m_back/dto/Partner/PartnerRegisterRequestDto.java
package com.mini_mes_3m_back.dto.Partner;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank; // 추가!
import jakarta.validation.constraints.Pattern; // 추가! (선택 사항이지만 brNum에 유용)

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartnerRegisterRequestDto {
    @NotBlank(message = "업체 유형은 필수 입력 항목입니다.") // partnerType도 필수라면 추가!
    private String partnerType; // 업체유형 (customer | supplier)

    @NotBlank(message = "사업자 등록번호는 필수 입력 항목입니다.")
//    @Pattern(regexp = "^[0-9]{3}-[0-9]{2}-[0-9]{5}$", message = "사업자 등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)") // 선택 사항, 패턴 검증
    private String brNum; // 사업자등록번호

    @NotBlank(message = "업체명은 필수 입력 항목입니다.")
    private String name; // 업체명

//    @NotBlank(message = "대표명은 필수 입력 항목입니다.")
    private String bossName; // 대표명

//    @NotBlank(message = "대표 전화번호는 필수 입력 항목입니다.")
    private String bossPhone; // 대표전화번호

//    @NotBlank(message = "기업 주소는 필수 입력 항목입니다.")
    private String address; // 기업 주소 정보

//    @NotBlank(message = "담당자명은 필수 입력 항목입니다.")
    private String representativeName; // 담당자명

//    @NotBlank(message = "담당자 전화번호는 필수 입력 항목입니다.")
    private String representativePhone; // 담당자 전화번호

    // 이메일 형식 검증
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String representativeEmail; // 담당자 이메일

    private String remark; // 비고 (필수 아니면 NotBlank 추가 X)
}