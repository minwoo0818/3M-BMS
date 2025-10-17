package com.mini_mes_3m_back.dto.Partner;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartnerPartialResponseDto {
    private Long partnerId;
    private String name; // 업체명
    private String brNum; // 사업자등록번호
    private String address; // 기업 주소 정보
    private String representativeName; // 담당자명
    private String representativePhone; // 담당자 전화번호
    private Boolean active; // 거래상태 (활성 여부)
}