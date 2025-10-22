// src/main/java/com/mini_mes_3m_back/entity/RawsItem.java (미누 엔티티 최종 확정 및 Builder 추가)
package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*; // Lombok Builder 추가

import java.time.OffsetDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor // Lombok NoArgsConstructor 유지 (기본 생성자 대체)
@AllArgsConstructor // Lombok AllArgsConstructor 유지 (필드들을 사용하는 생성자 대체)
@Builder // Builder 패턴 추가!
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

    private String color; // 색상

    // 미누 엔티티에 spec 필드가 원자재 규격 (양/단위) 역할을 함
    private String spec; // 원자재 규격 (양/단위)

    private String manufacturer; // 제조사
    private String remark; // 비고

    @ManyToOne(fetch = FetchType.LAZY) // 매입처 (Partner 엔티티와의 관계)
    @JoinColumn(name = "supplier_id", nullable = false) // 매입처는 필수
    private Partner supplier; // 매입처

    // isCancelled와 마찬가지로 default true 보장
    @Column(name = "active", nullable = false)
    @Builder.Default // Builder 패턴으로 객체 생성 시 기본값 true 보장
    private Boolean active = true; // 거래 상태 (기본값 active)

    private OffsetDateTime createdAt; // 생성일시
    private OffsetDateTime updatedAt; // 수정일시

    @PrePersist
    public void prePersist(){
        createdAt = OffsetDateTime.now();
        if (updatedAt == null) { // updatedAt이 이미 설정되어 있지 않다면 (새로운 엔티티일 경우)
            updatedAt = createdAt;
        }
        if (this.active == null) { // 혹시 Builder나 생성자를 통해 null이 들어올 경우를 대비한 최종 방어 로직
            this.active = true;
        }
    }

    @PreUpdate
    public void preUpdate(){
        updatedAt = OffsetDateTime.now(); // 업데이트 시 updatedAt 변경
        if (this.active == null) { // 혹시 업데이트 과정에서 null이 될 경우를 대비
            this.active = true;
        }
    }
}