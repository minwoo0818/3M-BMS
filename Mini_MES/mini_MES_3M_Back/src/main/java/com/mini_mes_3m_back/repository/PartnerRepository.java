package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {
    List<Partner> findByActiveTrue();
    Optional<Partner> findByName(String name);
    List<Partner> findByPartnerType(String partnerType);
    // type과 active 상태로 필터링하여 파트너 목록 조회
    @Query("SELECT p FROM Partner p WHERE p.partnerType = :partnerType AND p.active = true")
    List<Partner> findByPartnerTypeAndActiveTrue(@Param("partnerType") String partnerType);

    // 파트너 상세 조회 시 active 상태 조건 (필요시)
    Optional<Partner> findByPartnerIdAndActiveTrue(Long partnerId);
}
