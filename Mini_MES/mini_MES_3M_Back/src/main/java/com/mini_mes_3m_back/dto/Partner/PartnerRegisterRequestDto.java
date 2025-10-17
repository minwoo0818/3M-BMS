package com.mini_mes_3m_back.dto.Partner;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartnerRegisterRequestDto {
    private String partnerType; // 업체유형 (customer | supplier)
    private String brNum; // 사업자등록번호
    private String name; // 업체명
    private String bossName; // 대표명
    private String bossPhone; // 대표전화번호
    private String representativeName; // 담당자명
    private String representativePhone; // 담당자 전화번호
    private String representativeEmail; // 담당자 이메일
    private String address; // 기업 주소 정보
    private String remark; // 비고
}