package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
// getters / setters
@Table(name = "partners")
public class Partner {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long partnerId;

    @Column(nullable=false, length=20)
    private String partnerType; // customer | supplier

    @Column(nullable=false, length=50)
    private String name;

    private String brNum;
    private String bossName;
    private String bossPhone;
    private String representativeName;
    private String representativePhone;
    private String representativeEmail;
    @Column(columnDefinition = "text")
    private String address;
    @Column(columnDefinition = "text")
    private String remark;
    private Boolean active = true;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist(){
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }
    @PreUpdate
    public void preUpdate(){
        updatedAt = OffsetDateTime.now();
    }

}