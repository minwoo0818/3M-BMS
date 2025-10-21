package com.mini_mes_3m_back.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesItemRegisterDto {

    // 1. 업체 정보
    private Long partnerId;                       // 요청용: 선택된 partner ID
    // private PartnerPartialResponseDto partner;    // 응답용: 업체 정보 DTO

    // 2. 품목 정보
    private String itemName;       // 품목명
    private String itemCode;       // 품목번호
    private Integer price;         // 단가
    private String color;          // 색상
    private String classification; // 분류
    private String coatingMethod;  // 도장방식
    private String remark;         // 비고

    // 3. 라우팅/공정
    private List<Long> operationIds;     // 요청용: 선택된 공정 ID 리스트
}
