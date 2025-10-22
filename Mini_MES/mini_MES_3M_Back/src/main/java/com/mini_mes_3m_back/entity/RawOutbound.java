package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.*; // Lombok import 추가!

import java.time.OffsetDateTime;
import java.time.LocalDate; // 출고 일자 (shippedAt)는 LocalDate로 사용하는 것이 일반적!

@Entity
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor // Lombok 어노테이션 추가
@Table(name = "raw_outbound")
public class RawOutbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rawOutboundId;

    @Column(unique = true, nullable = false)
    private String rawOutboundMOUTNum;

    @ManyToOne(optional = false, fetch = FetchType.LAZY) // optional = false -> RawsItem이 반드시 있어야 함
    @JoinColumn(name = "raw_item_id") // RawsItem 엔티티의 PK를 참조
    private RawsItem rawsItem;

    @Column(nullable = false) // 출고 수량은 필수
    private Integer qty;

    @Column(nullable = false) // 출고 일자는 필수
    private LocalDate shippedAt; //  (OffsetDateTime 대신 LocalDate)

    private OffsetDateTime createdAt;
    // private OffsetDateTime updatedAt;


    @PrePersist
    public void prePersist() {
        createdAt = OffsetDateTime.now();
    }
    // @PreUpdate 필드는 미누 엔티티에 없으니 제거
}