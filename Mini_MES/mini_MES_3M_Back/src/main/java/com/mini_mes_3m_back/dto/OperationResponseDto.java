package com.mini_mes_3m_back.dto;

import com.mini_mes_3m_back.entity.Operation;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class OperationResponseDto
{
    //DB에서 생성된 Primary Key (수정, 삭제 요청 시 사용)
    private Long operationId;

    private String code;

    private String name;

    private String processContent;

    private Integer processTime;

 // Entity (Operations)를 Response DTO로 변환하는 정적 팩토리 메서드
    public  static OperationResponseDto fromEntity(Operation entity)
    {
        return OperationResponseDto.builder()
                .operationId(entity.getOperationId())
                .code(entity.getCode())
                .name(entity.getName())
                .processContent(entity.getProcessContent())
                .processTime(entity.getProcessTime())
                .build();
    }
}
