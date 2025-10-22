package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesOutbound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

public interface SalesOutboundRepository extends JpaRepository<SalesOutbound, Long> {
    @Query("SELECT MAX(o.outboundOUTNum) FROM SalesOutbound o WHERE o.outboundOUTNum LIKE CONCAT('OUT-', :today, '%')")
    String findLatestOutboundNum(@Param("today") String today);


}