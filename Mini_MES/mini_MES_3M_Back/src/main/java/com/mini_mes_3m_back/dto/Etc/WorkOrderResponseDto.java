package com.mini_mes_3m_back.dto.Etc;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrderResponseDto {
    private String lotNo;
    private String customerName;
    private String itemName;
    private String itemCode;
    private String classification;
    private String color;
    private String coatingMethod;
    private String note;
    private String routingInfo;
    private String photoPath; // 화면에서는 대표 사진으로 보여줌
}
