package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SalesItemRepository extends JpaRepository<SalesItem, Long> {
    Page<SalesItem> findByItemNameContainingIgnoreCase(String itemName, Pageable pageable);

    Optional<SalesItem> findByItemCode(String itemCode);

    @Query("SELECT si FROM SalesItem si JOIN FETCH si.partner p WHERE si.active = true AND p.active = true")
    List<SalesItem> findActiveSalesItemsWithActivePartner();

    @Query("SELECT si FROM SalesItem si JOIN FETCH si.partner p " +
            "WHERE si.active = true AND p.active = true " +
            "AND (:keyword IS NULL OR " +
            "LOWER(si.partnerName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(si.itemCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(si.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<SalesItem> searchActiveSalesItems(@Param("keyword") String keyword);

    @Query("SELECT si FROM SalesItem si JOIN FETCH si.partner p WHERE si.salesItemId = :salesItemId")
    SalesItem findByIdWithPartner(@Param("salesItemId") Long salesItemId);
}