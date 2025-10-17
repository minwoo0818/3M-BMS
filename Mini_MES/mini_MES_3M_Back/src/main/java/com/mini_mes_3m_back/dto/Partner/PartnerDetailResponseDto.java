// src/main/java/com/mini_mes_3m_back/dto/Partner/PartnerDetailResponseDto.java // DTO 이름 변경!
package com.mini_mes_3m_back.dto.Partner;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// 이 DTO는 상세 조회 응답에 사용됩니다. partnerId와 active 모두 포함.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PartnerDetailResponseDto {
    private Long partnerId; // 거래처의 고유 ID (응답에 포함)
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
    private Boolean active; // 거래 상태
}