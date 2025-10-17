package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    @ManyToOne
    @JoinColumn(name = "raw_item_id")
    private RawsItem rawItem;

    private Integer qty;
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() { updatedAt = OffsetDateTime.now(); }
    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }

    // Getter/Setter ...
}