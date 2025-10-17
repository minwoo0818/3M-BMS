package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
// Getter/Setter ...
@Table(name = "sales_outbound")
public class SalesOutbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long outboundId;

    @Column(unique = true, nullable = false)
    private String outboundOUTNum;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id")
    private SalesItem item;

    private Integer qty;
    private OffsetDateTime shippedAt;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private String status;

    @PrePersist
    public void prePersist() { createdAt = OffsetDateTime.now(); updatedAt = createdAt; }

    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }

}