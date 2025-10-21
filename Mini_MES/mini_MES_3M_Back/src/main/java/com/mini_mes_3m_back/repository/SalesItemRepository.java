package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SalesItemRepository extends JpaRepository<SalesItem, Long> {

    @Query("SELECT s FROM SalesItem s " +
            "WHERE (:kw IS NULL OR :kw = '') OR " +
            "(LOWER(s.itemName) LIKE LOWER(concat('%',:kw,'%')) " +
            " OR LOWER(s.itemCode) LIKE LOWER(concat('%',:kw,'%')) " +
            " OR LOWER(s.partnerName) LIKE LOWER(concat('%',:kw,'%')))")
    Page<SalesItem> searchByKeyword(@Param("kw") String keyword, Pageable pageable);

    Page<SalesItem> findByItemNameContainingIgnoreCase(String itemName, Pageable pageable);

    java.util.Optional<SalesItem> findByItemCode(String itemCode);
}
