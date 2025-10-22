// src/main/java/com/mini_mes_3m_back/entity/Inventory.java (수정!)
package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*; // Lombok import 추가!

import java.time.OffsetDateTime;

@Entity
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor // Lombok 어노테이션 추가
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    @OneToOne(fetch = FetchType.LAZY, optional = false) // RawsItem과의 1:1 관계 (각 RawsItem은 하나의 Inventory를 가짐)
    @JoinColumn(name = "raw_item_id", nullable = false, unique = true) // raw_item_id는 필수, 고유해야 함 (한 품목 당 하나의 재고)
    private RawsItem rawItem;

    @Column(nullable = false) // 재고 수량은 필수
    @Builder.Default // Builder 패턴으로 객체 생성 시 기본값 0 보장
    private Integer qty = 0; // 재고 수량 (기본값 0)

    private OffsetDateTime updatedAt; // updatedAt만 필요 (createdAt은 Inventory 생성 시 한 번만)

    // @PrePersist는 필요에 따라. Inventory는 RawsItem이 생성될 때 같이 생성되거나, 첫 입고 시 생성되는 로직 필요
    // 여기서는 @PrePersist에서 updatedAt만 설정하도록 할게
    @PrePersist
    public void prePersist() {
        if (updatedAt == null) { // 최초 생성 시점에만
            updatedAt = OffsetDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() { updatedAt = OffsetDateTime.now(); }

}