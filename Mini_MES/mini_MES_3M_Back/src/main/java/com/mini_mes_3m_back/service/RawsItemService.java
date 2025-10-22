// src/main/java/com/mini_mes_3m_back/service/RawsItemService.java (새로 생성!)
package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.RawsItem.*; // 모든 RawsItem DTO 임포트
import com.mini_mes_3m_back.dto.RawsItem.RawsItemDetailResponseDto;
import com.mini_mes_3m_back.entity.Partner;
import com.mini_mes_3m_back.entity.RawsItem;
import com.mini_mes_3m_back.repository.PartnerRepository; // PartnerRepository 임포트
import com.mini_mes_3m_back.repository.RawsItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class RawsItemService {

    private final RawsItemRepository rawsItemRepository;
    private final PartnerRepository partnerRepository; // PartnerRepository 주입

    public RawsItemService(RawsItemRepository rawsItemRepository, PartnerRepository partnerRepository) {
        this.rawsItemRepository = rawsItemRepository;
        this.partnerRepository = partnerRepository;
    }

    // --- 1. 원자재 품목 등록 ---
    @Transactional
    public RawsItemDetailResponseDto registerRawsItem(RawsItemRegisterRequestDto request) {
        // 품목번호 중복 확인
        rawsItemRepository.findByItemCode(request.getItemCode()).ifPresent(item -> {
            throw new IllegalArgumentException("이미 존재하는 품목번호입니다: " + request.getItemCode());
        });

        // 매입처 (Supplier) 찾기
        Partner supplier = partnerRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 매입처입니다. ID: " + request.getSupplierId()));

        // --- (RawsItem 객체 생성)을 Builder 패턴으로 수정! ---
        RawsItem newRawsItem = RawsItem.builder() // RawsItem.builder() 사용!
                .itemCode(request.getItemCode())
                .itemName(request.getItemName())
                .classification(request.getClassification())
                .color(request.getColor())
                .spec(request.getSpec())
                .manufacturer(request.getManufacturer())
                .remark(request.getRemark())
                .supplier(supplier) // Partner 엔티티 직접 할당
                .active(true) // 등록 시 active 기본값 true (엔티티의 @Builder.Default가 있으나 명시적으로 설정도 가능)
                .build(); // .build()로 마무리!

        RawsItem savedRawsItem = rawsItemRepository.save(newRawsItem);

        // 등록된 정보 반환 DTO로 변환
        return new RawsItemDetailResponseDto(
                savedRawsItem.getRawsItemId(),
                savedRawsItem.getItemCode(),
                savedRawsItem.getItemName(),
                savedRawsItem.getClassification(),
                savedRawsItem.getColor(),
                savedRawsItem.getSpec(),
                savedRawsItem.getManufacturer(),
                savedRawsItem.getRemark(),
                savedRawsItem.getSupplier().getPartnerId(), // 매입처 ID
                savedRawsItem.getSupplier().getName(), // 매입처명
                savedRawsItem.getActive()
        );
    }

    // --- 2. 원자재 품목 목록 조회 ---
    @Transactional(readOnly = true)
    public List<RawsItemPartialResponseDto> getAllRawsItems() {
        return rawsItemRepository.findAll().stream()
                .map(item -> new RawsItemPartialResponseDto(
                        item.getRawsItemId(),
                        item.getItemCode(),
                        item.getItemName(),
                        item.getClassification(),
                        item.getSupplier() != null ? item.getSupplier().getName() : null, // 매입처명 (null 체크)
                        item.getManufacturer(),
                        item.getActive()
                ))
                .collect(Collectors.toList());
    }

    // --- 3. 원자재 품목 상세 조회 (메서드명 변경 없고 DTO 이름만 변경) ---
    @Transactional(readOnly = true)
    public RawsItemResponseDto getRawsItemDetailById(Long rawsItemId) { // DTO 이름 변경!
        RawsItem rawsItem = rawsItemRepository.findById(rawsItemId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 원자재 품목입니다. ID: " + rawsItemId));

        // DTO의 필드에 맞춰 매핑
        return new RawsItemResponseDto( // DTO 이름 변경!
                rawsItem.getRawsItemId(),
                rawsItem.getItemCode(),
                rawsItem.getItemName(),
                rawsItem.getClassification(),
                rawsItem.getColor(),
                rawsItem.getSpec(),
                rawsItem.getManufacturer(),
                rawsItem.getRemark(),
                rawsItem.getSupplier().getPartnerId(),
                rawsItem.getSupplier().getName(),
                rawsItem.getActive(),
                rawsItem.getCreatedAt(),
                rawsItem.getUpdatedAt()
        );
    }

    // --- 4. 원자재 품목 정보 수정 (메서드명 변경 없고 DTO 이름만 변경) ---
    @Transactional
    public RawsItemResponseDto updateRawsItem(Long rawsItemId, RawsItemUpdateRequestDto request) { // DTO 이름 변경!
        RawsItem rawsItem = rawsItemRepository.findById(rawsItemId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 원자재 품목입니다. ID: " + rawsItemId));

        // 품목번호 변경 시 중복 확인 (기존 품목번호와 다를 경우에만)
        if (!rawsItem.getItemCode().equals(request.getItemCode())) {
            rawsItemRepository.findByItemCode(request.getItemCode()).ifPresent(item -> {
                throw new IllegalArgumentException("이미 존재하는 품목번호입니다: " + request.getItemCode());
            });
        }

        // 매입처 (Supplier) 찾기
        Partner supplier = partnerRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 매입처입니다. ID: " + request.getSupplierId()));

        rawsItem.setItemCode(request.getItemCode());
        rawsItem.setItemName(request.getItemName());
        rawsItem.setClassification(request.getClassification());
        rawsItem.setColor(request.getColor());
        rawsItem.setSpec(request.getSpec());
        rawsItem.setManufacturer(request.getManufacturer());
        rawsItem.setRemark(request.getRemark());
        rawsItem.setSupplier(supplier); // 매입처도 업데이트
        rawsItem.setActive(request.getActive());

        RawsItem updatedRawsItem = rawsItemRepository.save(rawsItem);

        // DTO의 필드에 맞춰 매핑
        return new RawsItemResponseDto( // DTO 이름 변경!
                updatedRawsItem.getRawsItemId(),
                updatedRawsItem.getItemCode(),
                updatedRawsItem.getItemName(),
                updatedRawsItem.getClassification(),
                updatedRawsItem.getColor(),
                updatedRawsItem.getSpec(),
                updatedRawsItem.getManufacturer(),
                updatedRawsItem.getRemark(),
                updatedRawsItem.getSupplier().getPartnerId(),
                updatedRawsItem.getSupplier().getName(),
                updatedRawsItem.getActive(),
                updatedRawsItem.getCreatedAt(),
                updatedRawsItem.getUpdatedAt()
        );
    }

    // --- 5. 원자재 품목 활성 상태 토글 (거래종료/거래재개) ---
    @Transactional
    public RawsItemPartialResponseDto updateRawsItemStatus(Long rawsItemId, Boolean newStatus) {
        RawsItem rawsItem = rawsItemRepository.findById(rawsItemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 원자재 품목입니다. ID: " + rawsItemId));

        rawsItem.setActive(newStatus);
        RawsItem updatedRawsItem = rawsItemRepository.save(rawsItem);

        return new RawsItemPartialResponseDto(
                updatedRawsItem.getRawsItemId(),
                updatedRawsItem.getItemCode(),
                updatedRawsItem.getItemName(),
                updatedRawsItem.getClassification(),
                updatedRawsItem.getSupplier() != null ? updatedRawsItem.getSupplier().getName() : null,
                updatedRawsItem.getManufacturer(),
                updatedRawsItem.getActive()
        );
    }

    // --- 검색 기능 (필요시 추가) ---
    // 예: 품목명 또는 품목번호로 검색하는 메서드
}