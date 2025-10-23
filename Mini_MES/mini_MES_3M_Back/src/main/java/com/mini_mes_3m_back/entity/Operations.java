package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "operations")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Operations {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long operationId;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private Integer standardTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OperationStatus status; // ⭐️ 상태 필드

    @Column(name = "operation_order")
    private Integer operationOrder; // 공정 순서


    @Column
    private OffsetDateTime startTime; // ⭐️ 공정 시작 시간

    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = OffsetDateTime.now();
        if (status == null) {
            status = OperationStatus.PENDING; // 기본값 설정
        }
    }

    // 전체 수정
    public void update(String code, String name, String description, Integer standardTime, OperationStatus status) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.standardTime = standardTime;
        this.status = status;
    }

    // 상태만 변경
    public void updateStatus(OperationStatus status) {
        this.status = status;
    }

    // 시작 시간 설정
    public void start() {
        this.startTime = OffsetDateTime.now();
        this.status = OperationStatus.IN_PROGRESS;
    }

    // 순서 변경
    public void updateOrder(Integer operationOrder) {
        this.operationOrder = operationOrder;
    }

    // ⭐️ 내부 enum 정의
    public enum OperationStatus {
        PENDING,        // 등록만 된 상태
        IN_PROGRESS,    // 진행 중
        COMPLETED,      // 완료됨
        ERROR           // 오류 발생
    }
}