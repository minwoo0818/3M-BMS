// src/main/java/com/mini_mes_3m_back/entity/RawsItem.java (수정!)
package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter@Setter
@AllArgsConstructor
@Table(name = "raws_items")
public class RawsItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rawsItemId; // 원자재 품목 고유 ID (PK)

    @Column(nullable = false, unique = true) // 품목번호는 필수, 고유해야 함
    private String itemCode; // 품목번호

    @Column(nullable = false) // 품목명은 필수
    private String itemName; // 품목명

    private String classification; // 분류 (페인트, 신나 등)

    private String color; // 색상 (새로 추가)

    // 기존 unit을 spec으로 변경하고, 원자재 규격 (양/단위) 정보를 담도록 함
    // @Column(nullable = false) // 규격은 필수
    private String spec; // 원자재 규격 (양/단위) - 필드명 변경

    private String manufacturer; // 제조사 (새로 추가)
    private String remark; // 비고 (새로 추가)

    // private java.math.BigDecimal price; // 요구사항에 없어 일단 제외 (필요시 활성화)

    @ManyToOne(fetch = FetchType.LAZY) // 매입처 (Partner 엔티티와의 관계)
    @JoinColumn(name = "supplier_id", nullable = false) // 매입처는 필수
    private Partner supplier; // 매입처

    private Boolean active = true; // 거래 상태 (기본값 active)

    private OffsetDateTime createdAt; // 생성일시
    private OffsetDateTime updatedAt; // 수정일시

    @PrePersist
    public void prePersist(){
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now(); // 최초 생성 시 updatedAt도 설정
    }

    @PreUpdate
    public void preUpdate(){
        updatedAt = OffsetDateTime.now(); // 업데이트 시 updatedAt 변경
    }

    // 기본 생성자 (JPA 필수)
    public RawsItem() {}

    // 필드들을 사용하는 생성자 (생성 시 편의를 위함)
    public RawsItem(String itemCode, String itemName, String classification, String color, String spec, String manufacturer, String remark, Partner supplier, Boolean active) {
        this.itemCode = itemCode;
        this.itemName = itemName;
        this.classification = classification;
        this.color = color;
        this.spec = spec;
        this.manufacturer = manufacturer;
        this.remark = remark;
        this.supplier = supplier;
        this.active = active;
    }
}