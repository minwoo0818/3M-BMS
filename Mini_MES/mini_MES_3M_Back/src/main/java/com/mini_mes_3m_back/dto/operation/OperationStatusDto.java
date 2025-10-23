package com.mini_mes_3m_back.dto.operation;

import com.mini_mes_3m_back.entity.Operations;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationStatusDto {
    private Long id;
    private Integer order;
    private Operations.OperationStatus status;
}