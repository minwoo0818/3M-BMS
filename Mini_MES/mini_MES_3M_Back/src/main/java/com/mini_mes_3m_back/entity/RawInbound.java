package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@Table(name = "raw_inbound")
public class RawInbound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rawInboundId;

    @Column(unique = true, nullable = false)
    private String rawInboundMINCNum;

    @ManyToOne(optional = false)
    @JoinColumn(name = "raw_item_id")
    private RawsItem rawItem;

    @Column(nullable = false)
    private Integer qty;

    @Column(nullable = false)
    private OffsetDateTime inbDate;

    @Column(length = 50, nullable = false)
    private String manufacturer;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = OffsetDateTime.now();
        if (rawInboundMINCNum == null) {
            rawInboundMINCNum = generateInboundNum(); // 생성 규칙에 따라 구현 필요
        }
    }

    // 예시: MINC-20251020-001 형식 생성기
    private String generateInboundNum() {
        String datePart = OffsetDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%03d", (int)(Math.random() * 999)); // 임시 랜덤 시퀀스
        return "MINC-" + datePart + "-" + sequence;
    }


}
