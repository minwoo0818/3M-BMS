package com.mini_mes_3m_back.dto.RawsItem;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

// 상세 조회, 등록/수정 후 응답에 사용될 DTO (기존 RawsItemRegisterRequestDto의 응답형 DTO로 활용)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RawsItemResponseDto {
    private Long rawsItemId;         // 원자재 품목 고유 ID (PK)
    private String itemCode;         // 품목번호 (수정 가능)
    private String itemName;         // 품목명 (수정 가능)
    private String classification;   // 분류 (수정 가능)
    private String color;            // 색상 (수정 가능)
    private String spec;             // 원자재 규격 (양/단위) (수정 가능)
    private String manufacturer;     // 제조사 (수정 가능)
    private String remark;           // 비고 (수정 가능)

    // 조회용 (매입처명) 및 수정 시 필요한 정보
    private Long supplierId;         // 매입처 ID (수정 시 필요)
    private String supplierName;     // 매입처명 (조회용, 수정 불가)
    private Boolean active;          // 활성화 여부 (수정 가능)

    private OffsetDateTime createdAt; // 등록일
    private OffsetDateTime updatedAt; // 수정일
}