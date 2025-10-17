// src/main/java/com/mini_mes_3m_back/service/PartnerService.java
package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.Partner.PartnerRegisterRequestDto;
import com.mini_mes_3m_back.dto.Partner.PartnerPartialResponseDto;
import com.mini_mes_3m_back.entity.Partner;
import com.mini_mes_3m_back.repository.PartnerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PartnerService {

    private final PartnerRepository partnerRepository;

    public PartnerService(PartnerRepository partnerRepository) {
        this.partnerRepository = partnerRepository;
    }

    // 거래처 등록 (변동 없음)
    @Transactional
    public PartnerRegisterRequestDto registerPartner(PartnerRegisterRequestDto request) {
        partnerRepository.findByName(request.getName()).ifPresent(partner -> {
            throw new IllegalArgumentException("이미 존재하는 업체명입니다: " + request.getName());
        });

        Partner newPartner = new Partner();
        newPartner.setPartnerType(request.getPartnerType());
        newPartner.setBrNum(request.getBrNum());
        newPartner.setName(request.getName());
        newPartner.setBossName(request.getBossName());
        newPartner.setBossPhone(request.getBossPhone());
        newPartner.setRepresentativeName(request.getRepresentativeName());
        newPartner.setRepresentativePhone(request.getRepresentativePhone());
        newPartner.setRepresentativeEmail(request.getRepresentativeEmail());
        newPartner.setAddress(request.getAddress());
        newPartner.setRemark(request.getRemark());

        Partner savedPartner = partnerRepository.save(newPartner);

        return new PartnerRegisterRequestDto(
                savedPartner.getPartnerType(),
                savedPartner.getBrNum(),
                savedPartner.getName(),
                savedPartner.getBossName(),
                savedPartner.getBossPhone(),
                savedPartner.getRepresentativeName(),
                savedPartner.getRepresentativePhone(),
                savedPartner.getRepresentativeEmail(),
                savedPartner.getAddress(),
                savedPartner.getRemark()
        );
    }

    // 모든 거래처 일부 조회 - PartnerPartialResponseDto 필드 변경 반영
    @Transactional(readOnly = true)
    public List<PartnerPartialResponseDto> getAllPartnersPartial(String partnerType) {
        List<Partner> partners;

        if (partnerType != null && !partnerType.trim().isEmpty()) {
            partners = partnerRepository.findByPartnerType(partnerType);
        } else {
            partners = partnerRepository.findAll();
        }

        return partners.stream()
                .map(partner -> new PartnerPartialResponseDto(
                        partner.getPartnerId(), // <-- Entity의 partnerId를 DTO에 포함!
                        partner.getName(),
                        partner.getBrNum(),
                        partner.getAddress(),
                        partner.getRepresentativeName(),
                        partner.getRepresentativePhone(),
                        partner.getActive()
                ))
                .collect(Collectors.toList());
    }

    // 특정 거래처 상세 조회 (변동 없음)
    @Transactional(readOnly = true)
    public PartnerRegisterRequestDto getPartnerDetailById(Long partnerId) {
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 거래처입니다. ID: " + partnerId));

        return new PartnerRegisterRequestDto(
                partner.getPartnerType(),
                partner.getBrNum(),
                partner.getName(),
                partner.getBossName(),
                partner.getBossPhone(),
                partner.getRepresentativeName(),
                partner.getRepresentativePhone(),
                partner.getRepresentativeEmail(),
                partner.getAddress(),
                partner.getRemark()
        );
    }

    // 거래처 상태 (active) 업데이트 메서드 추가
    @Transactional
    public PartnerPartialResponseDto updatePartnerStatus(Long partnerId, Boolean newStatus) {
        // 1. 해당 ID의 거래처를 찾습니다. 없으면 예외 발생
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 거래처입니다. ID: " + partnerId));

        // 2. 새로운 상태 값으로 업데이트합니다.
        partner.setActive(newStatus);

        // 3. 변경된 엔티티를 저장하고, 업데이트된 DTO를 반환합니다.
        // @PreUpdate에 의해 updatedAt이 자동으로 업데이트됩니다.
        Partner updatedPartner = partnerRepository.save(partner); // save()를 호출하면 Entity가 Persist 상태이므로 자동으로 업데이트 반영

        // 업데이트된 엔티티를 프론트엔드에 필요한 DTO로 변환하여 반환
        return new PartnerPartialResponseDto(
                updatedPartner.getPartnerId(),
                updatedPartner.getName(),
                updatedPartner.getBrNum(),
                updatedPartner.getAddress(),
                updatedPartner.getRepresentativeName(),
                updatedPartner.getRepresentativePhone(),
                updatedPartner.getActive()
        );
    }
}