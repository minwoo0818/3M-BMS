package com.mini_mes_3m_back.dto.operation;

import com.mini_mes_3m_back.entity.Operations;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationUpdateDto {
    private String code;
    private String name;
    private String description;
    private Integer standardTime;
    private Operations status;
}