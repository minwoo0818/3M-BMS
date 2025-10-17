package com.mini_mes_3m_back.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "files")
public class FileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    @ManyToOne
    @JoinColumn(name = "sales_item_id")
    private SalesItem salesItem;

    private String originFilename;
    private String filename;

    @Column(columnDefinition = "text")
    private String url;

    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() { createdAt = OffsetDateTime.now(); }

    // Getter/Setter ...
}