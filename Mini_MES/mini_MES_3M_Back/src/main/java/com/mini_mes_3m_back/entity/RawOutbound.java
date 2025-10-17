package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
// Getter/Setter ...
@Table(name = "raw_outbound")
public class RawOutbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rawOutboundId;

    @Column(unique = true, nullable = false)
    private String rawOutboundMOUTNum;

    @ManyToOne(optional = false)
    @JoinColumn(name = "raw_item_id")
    private RawsItem rawItem;

    private Integer qty;
    private OffsetDateTime shippedAt;
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() { createdAt = OffsetDateTime.now(); }
}