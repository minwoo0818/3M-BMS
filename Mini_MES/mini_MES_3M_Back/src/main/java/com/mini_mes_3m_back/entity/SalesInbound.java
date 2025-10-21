// src/main/java/com/mini_mes_3m_back/entity/SalesInbound.java (미누 엔티티 그대로 사용)
package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.time.LocalDate; // 입고 일자를 위한 LocalDate (receivedAt이 LocalDate 타입이라면)

@Entity
@Getter // Lombok 어노테이션 추가
@Setter // Lombok 어노테이션 추가
@Builder // Lombok 어노테이션 추가 (Service에서 Builder 패턴 사용)
@NoArgsConstructor // Lombok 어노테이션 추가
@AllArgsConstructor // Lombok 어노테이션 추가
@Table(name = "sales_inbound")
public class SalesInbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inboundId; // PK

    @Column(unique = true, nullable = false)
    private String inboundLOTNum; // LOT 번호

    @ManyToOne(optional = false, fetch = FetchType.LAZY) // optional = false -> SalesItem이 반드시 있어야 함
    @JoinColumn(name = "item_id") // SalesItem 엔티티의 PK를 참조
    private SalesItem item; // 입고된 수주 품목 (SalesItem 참조)

    private Integer lastOperationSeq = 0; // 입고와는 직접적인 관련 없음 (일단 유지)
    @Column(nullable = false) // 수량은 필수
    private Integer qty; // 입고 수량
    @Column(nullable = false) // 입고 일자는 필수 (LocalDate로 가정)
    private LocalDate receivedAt; // 입고 일자

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private Boolean isCancelled = false;
    private Boolean isOutboundProcessed = false;

    @PrePersist
    public void prePersist() {
        createdAt = OffsetDateTime.now();
        if (updatedAt == null) { // updatedAt이 이미 설정되어 있지 않다면 (새로운 엔티티일 경우)
            updatedAt = createdAt;
        }
    }

    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }

    // 생성자, Getter, Setter는 Lombok으로 대체
}