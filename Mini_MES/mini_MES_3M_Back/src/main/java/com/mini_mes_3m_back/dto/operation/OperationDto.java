package com.mini_mes_3m_back.dto.operation;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperationDto {
    private Long operationId;   // 공정 ID
    private String code;        // 공정 코드
    private String name;        // 공정명
    private String description; // 공정 내용
    private Integer standardTime; // 소요 시간 (분)
}
