package com.mini_mes_3m_back.dto.salesItem;

import com.mini_mes_3m_back.dto.operation.OperationDto;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesItemDetailViewDto {
    private Long salesItemId;
    private Long partnerId;
    private String partnerName;
    private String itemCode;
    private String itemName;
    private Integer price;
    private String color;
    private String classification;
    private String coatingMethod;
    private String remark;
    private Boolean active;
    private String imagePath;
    private List<OperationDto> operations; // 상세조회 시 포함
}
