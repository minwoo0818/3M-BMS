package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "raws_items")
public class RawsItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rawsItemId;

    private String itemCode;
    private String itemName;
    private String classification;
    private String unit;
    private java.math.BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Partner supplier;

    private Boolean active = true;
    private OffsetDateTime createdAt;
    @PrePersist public void prePersist(){ createdAt = OffsetDateTime.now(); }
    // getters / setters
}
