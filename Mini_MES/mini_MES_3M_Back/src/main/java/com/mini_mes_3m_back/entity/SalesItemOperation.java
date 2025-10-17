package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter @Setter
@Table(name = "sales_item_operations")
public class SalesItemOperation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemOperationId;

    @ManyToOne(optional=false)
    @JoinColumn(name="sales_item_id")
    private SalesItem salesItem;

    @ManyToOne(optional=false)
    @JoinColumn(name="operation_id")
    private Operations operation;

    @Column(nullable=false)
    private Integer seq;

    private OffsetDateTime startTime;
    @Column(columnDefinition = "text")
    private String remark;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @PrePersist public void prePersist(){ createdAt = OffsetDateTime.now(); updatedAt = createdAt;}
    @PreUpdate public void preUpdate(){ updatedAt = OffsetDateTime.now(); }
    // getters / setters
}
