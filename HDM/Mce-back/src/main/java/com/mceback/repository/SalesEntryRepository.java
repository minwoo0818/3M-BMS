package com.mceback.repository;

import com.mceback.entity.SalesEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesEntryRepository extends JpaRepository<SalesEntry, Long> {
    // 예: List<SalesEntry> findByCustomerName(String customerName);
}