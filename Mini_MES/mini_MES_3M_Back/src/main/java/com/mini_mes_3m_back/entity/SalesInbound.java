package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
// Getter/Setter ...
@Table(name = "sales_inbound")
public class SalesInbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inboundId;

    @Column(unique = true, nullable = false)
    private String inboundLOTNum;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id")
    private SalesItem item;

    private Integer lastOperationSeq = 0;
    private Integer qty;
    private OffsetDateTime receivedAt;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private Boolean isCancelled = false;
    private Boolean isOutboundProcessed = false;

    @PrePersist
    public void prePersist() {
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }


}