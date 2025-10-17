package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
// Getter/Setter ...
@Table(name = "raw_inbound")
public class RawInbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rawInboundId;

    @Column(unique = true, nullable = false)
    private String rawInboundMINCNum;

    @ManyToOne(optional = false)
    @JoinColumn(name = "raw_item_id")
    private RawsItem rawItem;

    private Integer qty;
    private OffsetDateTime inbDate;
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() { createdAt = OffsetDateTime.now(); }

}
