package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@Table(name = "sales_outbound")
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
    private OffsetDateTime shippedAt;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private Boolean status;

    @PrePersist
    public void prePersist() { createdAt = OffsetDateTime.now(); updatedAt = createdAt; }

    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }

}