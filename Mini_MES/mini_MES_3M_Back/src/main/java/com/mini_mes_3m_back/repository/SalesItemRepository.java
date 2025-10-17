package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalesItemRepository extends JpaRepository<SalesItem, Long> {
    Page<SalesItem> findByItemNameContainingIgnoreCase(String itemName, Pageable pageable);

    Optional<SalesItem> findByItemCode(String itemCode);
}