package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.RawOutbound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface RawOutboundRepository extends JpaRepository<RawOutbound, Long> {
    // 특정 날짜의 출고 번호 자동 부여를 위한 count
    long countByRawOutboundMOUTNumStartingWith(String prefix);

    // 출고 번호로 조회
    Optional<RawOutbound> findByRawOutboundMOUTNum(String rawOutboundMOUTNum);
}