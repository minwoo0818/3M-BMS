package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.SalesInbound;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SalesInboundRepository extends JpaRepository<SalesInbound, Long> {
    // 특정 날짜의 LOT 번호 자동 부여를 위한 count
    long countByInboundLOTNumStartingWith(String prefix); // inboundLOTNum 필드명에 맞게 변경!

    // 기타 필요한 조회 메서드 추가 가능
}