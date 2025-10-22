// src/main/java/com/mini_mes_3m_back/entity/RawInbound.java (최종 수정!)
package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*;
// import org.hibernate.annotations.ColumnDefault; // 이제 필요 없을 확률 높음

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor // Lombok NoArgsConstructor 유지
@AllArgsConstructor // Lombok AllArgsConstructor 유지
@Builder // Lombok Builder 유지
@Table(name = "raw_inbound")
public class RawInbound {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rawInboundId;

    @Column(nullable = false, unique = true)
    private String rawInboundNum;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "raws_item_id", nullable = false)
    private RawsItem rawsItem;

    @Column(nullable = false)
    private Integer qty;

    @Column(nullable = false)
    private LocalDate inboundDate;

    @Column(nullable = false)
    private LocalDate manufacturingDate;

    // --- 필드 초기화를 여기서 강제! ---
    @Column(name = "is_cancelled", nullable = false)
    @Builder.Default // Builder 사용시 false로 기본값 설정 (매우 중요)
    private Boolean isCancelled = false; // 직접 초기화 (Java 코드 레벨)

    @Column(name = "is_outbound_processed", nullable = false)
    @Builder.Default // Builder 사용시 false로 기본값 설정 (매우 중요)
    private Boolean isOutboundProcessed = false;
    // ------------------------------------

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // --- @PrePersist에서 최종 방어! ---
    @PrePersist
    public void prePersist(){
        createdAt = OffsetDateTime.now();
        if (updatedAt == null) {
            updatedAt = createdAt;
        }
        // 혹시 Builder나 생성자를 통해 null이 들어올 경우를 대비한 최종 방어 로직
        // 이렇게 하면 isCancelled가 어떤 경로로 null이 되더라도 DB에 도달하기 전에 false로 강제 설정됨
        if (this.isCancelled == null) { // this.isCancelled가 null이면
            this.isCancelled = false; // false로 강제 설정
        }
        if (this.isOutboundProcessed == null) { // this.isOutboundProcessed가 null이면
            this.isOutboundProcessed = false; // false로 강제 설정
        }
    }

    @PreUpdate
    public void preUpdate(){
        updatedAt = OffsetDateTime.now();
    }
}