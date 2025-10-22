package com.mini_mes_3m_back.dto.Partner;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// PartnerListRowData와 1:1 매핑
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartnerListRowDataDto {
    private Long partnerId;      // 파트너 고유 ID
    private String name;         // 업체명
    private String brNum;        // 사업자 등록 번호
    private String address;      // 주소
    private String representativeName; // 대표자 이름
    private String representativePhone; // 대표자 전화번호
    private Boolean active;      // 활성화 여부
    private String partnerType;  // 파트너 유형 (customer, supplier)
}