package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
// getters / setters
@Table(name = "operations")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Operation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long operationId;

    @Column(unique=true, nullable=false, length=20)
    private String code;

    @Column(nullable=false, length=50)
    private String name;

    @Column(columnDefinition = "text")
    private String processContent;

    @Column(nullable = false)
    private Integer processTime;

    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist(){ createdAt = OffsetDateTime.now(); }
    // getters / setters

    // Operations.java (엔티티 파일에 추가 필요)
    public void update(String code, String name, String processContent, Integer processTime) {
        this.code = code;
        this.name = name;
        this.processContent = processContent;
        this.processTime = processTime;
        // this.updatedAt = OffsetDateTime.now(); // 필요하다면 수정 시간도 업데이트
    }
}


