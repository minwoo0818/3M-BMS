package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.RawInbound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RawInboundRepository extends JpaRepository<RawInbound, Long> {
    // 특정 날짜의 입고 번호 자동 부여를 위한 count
    long countByRawInboundNumStartingWith(String prefix);

    // 입고 번호로 조회
    Optional<RawInbound> findByRawInboundNum(String rawInboundNum);
}