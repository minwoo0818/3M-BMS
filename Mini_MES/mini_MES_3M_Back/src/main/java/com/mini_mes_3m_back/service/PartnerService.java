package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.Partner.PartnerRegisterRequestDto; // 변경된 패키지와 DTO 이름 반영!
import com.mini_mes_3m_back.dto.Partner.PartnerPartialResponseDto; // 변경된 패키지와 DTO 이름 반영!
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

    // 거래처 등록
    @Transactional
    public PartnerRegisterRequestDto registerPartner(PartnerRegisterRequestDto request) { // DTO 이름 변경!
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

        return new PartnerRegisterRequestDto( // DTO 이름 변경!
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

    // 모든 거래처 일부 조회 - partnerType 필터링 로직 재추가!
    @Transactional(readOnly = true)
    public List<PartnerPartialResponseDto> getAllPartnersPartial(String partnerType) { // DTO 이름 및 인자 추가!
        List<Partner> partners;

        if (partnerType != null && !partnerType.trim().isEmpty()) {
            partners = partnerRepository.findByPartnerType(partnerType);
        } else {
            // partnerType이 제공되지 않으면 모든 거래처를 반환
            // 아니면 여기서 "partnerType을 반드시 입력해야 합니다" 같은 예외를 던져도 좋아!
            partners = partnerRepository.findAll();
        }

        return partners.stream()
                .map(partner -> new PartnerPartialResponseDto( // DTO 이름 변경!
                        partner.getName(),
                        partner.getBrNum(),
                        partner.getAddress(),
                        partner.getRepresentativeName(),
                        partner.getRepresentativePhone(),
                        partner.getActive()
                ))
                .collect(Collectors.toList());
    }

    // 특정 거래처 상세 조회
    @Transactional(readOnly = true)
    public PartnerRegisterRequestDto getPartnerDetailById(Long partnerId) { // DTO 이름 변경!
        Partner partner = partnerRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 거래처입니다. ID: " + partnerId));

        return new PartnerRegisterRequestDto( // DTO 이름 변경!
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
}