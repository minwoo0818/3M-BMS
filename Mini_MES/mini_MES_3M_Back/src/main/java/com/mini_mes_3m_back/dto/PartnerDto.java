package com.mini_mes_3m_back.dto;

public record PartnerDto(
        Long partnerId,
        String partnerType,
        String name,
        String brNum,
        String bossName,
        String bossPhone,
        String representativeName,
        String representativePhone,
        String representativeEmail,
        String address,
        String remark,
        Boolean active
) {}