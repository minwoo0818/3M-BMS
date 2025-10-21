package com.mini_mes_3m_back.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesItemDetailViewDto {
    private Long salesItemId;
    private Long partnerId;
    private String partnerName;
    private String itemName;
    private String itemCode;
    private Integer price;
    private String color;
    private String classification;
    private String coatingMethod;
    private String remark;
    private Boolean active;
    private List<OperationDto> operations; // 상세조회 시 포함
}
