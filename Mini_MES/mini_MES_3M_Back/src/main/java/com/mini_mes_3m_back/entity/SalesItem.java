package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "sales_items")
public class SalesItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long salesItemId;

    // optional partner FK
    @ManyToOne
    @JoinColumn(name="partner_id")
    private Partner partner;

    @Column(nullable=false, length=50)
    private String partnerName;

    @Column(nullable=false, length=20)
    private String itemCode;

    @Column(nullable=false, length=100)
    private String itemName;

    @Column(nullable=false, length=20)
    private String classification;

    private String unit;
    private Integer price;
    private String color;
    private String coatingMethod;
    private Integer totalOperations = 0;
    @Column(columnDefinition = "text")
    private String remark;
    private Boolean active = true;
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "salesItem", cascade = CascadeType.ALL)
    private List<SalesItemOperation> operations;

    @PrePersist public void prePersist(){ createdAt = OffsetDateTime.now(); }
    // getters / setters
}
