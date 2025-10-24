package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
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

    @Column(columnDefinition = "text") // routing 정보 추가
    private String routing;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    private OffsetDateTime createdAt;

    private String imagePath;

    @OneToMany(mappedBy = "salesItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalesItemOperation> operations = new ArrayList<>();

    @PrePersist
    public void prePersist(){ createdAt = OffsetDateTime.now(); }

    public void updateOperations(List<SalesItemOperation> newOperations) {
        this.operations.clear();
        if (newOperations != null) {
            this.operations.addAll(newOperations);
        }
    }
}
