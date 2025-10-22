// src/main/java/com/mini_mes_3m_back/entity/SalesInbound.java (수정!)
package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault; // 이 부분 import 추가!

import java.time.OffsetDateTime;
import java.time.LocalDate;

@Entity
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@Table(name = "sales_inbound")
public class SalesInbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inboundId;

    @Column(unique = true, nullable = false)
    private String inboundLOTNum;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private SalesItem item;

    @Builder.Default
    private Integer lastOperationSeq = 0;

    @Column(nullable = false)
    private Integer qty;

    // ✅ 새로 추가
    @Column(nullable = false)
    private Integer remainingQty;

    @Column(nullable = false)
    private LocalDate receivedAt;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Column(name = "is_cancelled", nullable = false) // @ColumnDefault("TINYINT(1) DEFAULT 0")를 제거하고 nullable=false만 남겨둠
    @Builder.Default // Builder로 생성 시 이 필드의 기본값을 false로 설정하도록 명시
    private Boolean isCancelled = false; // 자바 코드에서의 기본값 유지

    @Column(name = "is_outbound_processed", nullable = false) // 위와 동일
    @Builder.Default // Builder로 생성 시 이 필드의 기본값을 false로 설정하도록 명시
    private Boolean isOutboundProcessed = false;
    // -----------------------------------------------------

    @PrePersist // 엔티티가 영속화되기 전에 실행
    public void prePersist() {
        createdAt = OffsetDateTime.now();
        if (updatedAt == null) {
            updatedAt = createdAt;
        }

        // ✅ 신규 등록 시 잔여 수량 = 입고 수량
        if (remainingQty == null) remainingQty = qty;

        // @Builder.Default와 @Column(nullable=false)로 대부분 해결되므로, 여기서의 추가 null 체크는 선택적.
        // 하지만 혹시 모를 상황을 대비해 아래와 같이 null 체크 로직을 유지하는 것도 좋음
        if (isCancelled == null) { // Builder 또는 외부에서 null로 설정했을 경우 대비 (방어적)
            isCancelled = false;
        }
        if (isOutboundProcessed == null) { // Builder 또는 외부에서 null로 설정했을 경우 대비 (방어적)
            isOutboundProcessed = false;
        }
    }

    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }
}