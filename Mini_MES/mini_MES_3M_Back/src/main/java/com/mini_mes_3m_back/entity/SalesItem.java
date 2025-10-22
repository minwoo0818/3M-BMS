package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "active", nullable = false) // 'active' 컬럼에 NULL을 허용하지 않도록 설정
    @Builder.Default // Builder 패턴으로 객체 생성 시 이 필드의 기본값을 true로 설정하도록 명시
    private Boolean active = true; // 자바 코드에서의 기본값 유지
    private OffsetDateTime createdAt;

    private String imagePath;

    // SalesItemOperation과의 관계 설정 (mappedBy 필드가 올바르게 설정됨)
    @OneToMany(mappedBy = "salesItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesItemOperation> operations;


    @PrePersist public void prePersist(){ createdAt = OffsetDateTime.now(); }
}