package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
        import java.time.OffsetDateTime;

@Entity
@Table(name = "operations")
public class Operations {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long operationId;

    @Column(unique=true, nullable=false, length=20)
    private String code;

    @Column(nullable=false, length=50)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    private Integer standardTime;
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist(){ createdAt = OffsetDateTime.now(); }
    // getters / setters
}
