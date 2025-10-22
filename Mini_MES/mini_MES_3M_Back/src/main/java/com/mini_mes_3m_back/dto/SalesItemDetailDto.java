package com.mini_mes_3m_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class SalesItemDetailDto {
    private Long salesItemId;
    private String partnerName;
    private String itemCode;
    private String itemName;
    private String classification;
    private Integer price;
    private String color;
    private String coatingMethod;
    private String remark;
    private String imagePath;
    private List<OperationDto> operations;
}
