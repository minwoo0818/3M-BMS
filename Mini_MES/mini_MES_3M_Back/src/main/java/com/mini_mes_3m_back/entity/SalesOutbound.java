package com.mini_mes_3m_back.entity;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@Table(name = "sales_outbound")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer"})
public class SalesOutbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long outboundId;

    @Column(unique = true, nullable = false)
    private String outboundOUTNum;    //출고 문서번호

    @ManyToOne(optional = false)
    @JoinColumn(name = "inbound_id")
    private SalesInbound inbound;

    private Integer qty;

    @Column(name = "shipped_at")
    private LocalDate shippedAt;


    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Column(nullable = false)
    private Boolean status = true; // 출고 상태 (true: 정상, false: 취소됨)

    @Column(nullable = false)
    private Boolean isCancelled = false; // 삭제 여부 (실제 삭제 X, 이력 조회 시 필터링)

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }

}