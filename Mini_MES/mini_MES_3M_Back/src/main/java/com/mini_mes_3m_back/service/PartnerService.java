package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.Partner.*;
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

    @Transactional
    public PartnerRegisterRequestDto registerPartner(PartnerRegisterRequestDto request) {
        partnerRepository.findByName(request.getName()).ifPresent(p -> {
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

    @Transactional(readOnly = true)
    public List<PartnerPartialResponseDto> getAllPartnersPartial(String partnerType) {
        List<Partner> partners;
        if (partnerType != null && !partnerType.trim().isEmpty()) {
            partners = partnerRepository.findByPartnerType(partnerType);
        } else {
            partners = partnerRepository.findAll();
        }

        return partners.stream()
                .map(p -> new PartnerPartialResponseDto(
                        p.getPartnerId(),
                        p.getName(),
                        p.getBrNum(),
                        p.getAddress(),
                        p.getRepresentativeName(),
                        p.getRepresentativePhone(),
                        p.getActive()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PartnerDetailResponseDto getPartnerDetailById(Long partnerId) {
        Partner p = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 거래처입니다. ID: " + partnerId));

        return new PartnerDetailResponseDto(
                p.getPartnerId(),
                p.getPartnerType(),
                p.getBrNum(),
                p.getName(),
                p.getBossName(),
                p.getBossPhone(),
                p.getRepresentativeName(),
                p.getRepresentativePhone(),
                p.getRepresentativeEmail(),
                p.getAddress(),
                p.getRemark(),
                p.getActive()
        );
    }

    @Transactional
    public PartnerPartialResponseDto updatePartnerStatus(Long partnerId, Boolean newStatus) {
        Partner p = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 거래처입니다. ID: " + partnerId));
        p.setActive(newStatus);
        Partner updated = partnerRepository.save(p);

        return new PartnerPartialResponseDto(
                updated.getPartnerId(),
                updated.getName(),
                updated.getBrNum(),
                updated.getAddress(),
                updated.getRepresentativeName(),
                updated.getRepresentativePhone(),
                updated.getActive()
        );
    }

    @Transactional
    public PartnerDetailResponseDto updatePartner(Long partnerId, PartnerDetailUpdateRequestDto request) {
        Partner p = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 거래처입니다. ID: " + partnerId));

        p.setPartnerType(request.getPartnerType());
        p.setBrNum(request.getBrNum());
        p.setName(request.getName());
        p.setBossName(request.getBossName());
        p.setBossPhone(request.getBossPhone());
        p.setRepresentativeName(request.getRepresentativeName());
        p.setRepresentativePhone(request.getRepresentativePhone());
        p.setRepresentativeEmail(request.getRepresentativeEmail());
        p.setAddress(request.getAddress());
        p.setRemark(request.getRemark());
        p.setActive(request.getActive());

        Partner updated = partnerRepository.save(p);

        return new PartnerDetailResponseDto(
                updated.getPartnerId(),
                updated.getPartnerType(),
                updated.getBrNum(),
                updated.getName(),
                updated.getBossName(),
                updated.getBossPhone(),
                updated.getRepresentativeName(),
                updated.getRepresentativePhone(),
                updated.getRepresentativeEmail(),
                updated.getAddress(),
                updated.getRemark(),
                updated.getActive()
        );
    }

    @Transactional(readOnly = true)
    public List<PartnerPartialResponseDto> getAllActivePartners() {
        List<Partner> partners = partnerRepository.findByActiveTrue();
        return partners.stream()
                .map(p -> new PartnerPartialResponseDto(
                        p.getPartnerId(),
                        p.getName(),
                        p.getBrNum(),
                        p.getAddress(),
                        p.getRepresentativeName(),
                        p.getRepresentativePhone(),
                        p.getActive()
                ))
                .collect(Collectors.toList());
    }

    // --- 활성화된 특정 타입의 파트너 목록 조회 ---
    @Transactional(readOnly = true)
    public List<PartnerListRowDataDto> getActivePartnersByType(String partnerType) {
        List<Partner> partners = partnerRepository.findByPartnerTypeAndActiveTrue(partnerType); // 수정된 리포지토리 메서드 사용
        return partners.stream()
                .map(partner -> new PartnerListRowDataDto(
                        partner.getPartnerId(),
                        partner.getName(),
                        partner.getBrNum(),
                        partner.getAddress(),
                        partner.getRepresentativeName(),
                        partner.getRepresentativePhone(),
                        partner.getActive(),
                        partner.getPartnerType()
                ))
                .collect(Collectors.toList());
    }
}
