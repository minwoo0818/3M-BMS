package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.*;
import com.mini_mes_3m_back.dto.Partner.PartnerPartialResponseDto;
import com.mini_mes_3m_back.entity.*;
import com.mini_mes_3m_back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesItemService {

    private final SalesItemRepository salesItemRepository;
    private final PartnerRepository partnerRepository;
    private final OperationsRepository operationsRepository;
    private final SalesItemOperationRepository salesItemOperationRepository;

    // ==============================
    // 1️⃣ 수주품목 등록
    // ==============================
    @Transactional
    public SalesItemRegisterDto createSalesItem(SalesItemRegisterDto dto) {
        Partner partner = null;
        if (dto.getPartnerId() != null) {
            partner = partnerRepository.findById(dto.getPartnerId())
                    .orElseThrow(() -> new RuntimeException("Partner not found"));
        }

        SalesItem salesItem = SalesItem.builder()
                .partner(partner)
                .partnerName(partner != null ? partner.getName() : null)
                .itemCode(dto.getItemCode())
                .itemName(dto.getItemName())
                .classification(dto.getClassification())
                .price(dto.getPrice())
                .color(dto.getColor())
                .coatingMethod(dto.getCoatingMethod())
                .remark(dto.getRemark())
                .build();

        // 공정 매핑
        if (dto.getOperationIds() != null && !dto.getOperationIds().isEmpty()) {
            List<Operations> operations = operationsRepository.findAllById(dto.getOperationIds());
            List<SalesItemOperation> itemOperations = operations.stream()
                    .map(op -> {
                        SalesItemOperation sio = new SalesItemOperation();
                        sio.setSalesItem(salesItem);
                        sio.setOperation(op);
                        sio.setSeq(dto.getOperationIds().indexOf(op.getOperationId()) + 1);
                        return sio;
                    })
                    .collect(Collectors.toList());

            salesItem.setOperations(itemOperations);
            salesItem.setTotalOperations(itemOperations.size());
        }

        SalesItem saved = salesItemRepository.save(salesItem);
        return mapToRegisterDto(saved); // 등록용 DTO 변환
    }

    // ==============================
    // 2️⃣ 전체 조회 (조회용 DTO 사용)
    // ==============================
    @Transactional(readOnly = true)
    public List<SalesItemSearchDto> getAllSalesItemsForSearch() {
        return salesItemRepository.findAll().stream()
                .map(this::mapToSearchDto)
                .collect(Collectors.toList());
    }

    // 이름 검색
    @Transactional(readOnly = true)
    public List<SalesItemSearchDto> searchSalesItemsByName(String itemName) {
        return salesItemRepository.findByItemNameContainingIgnoreCase(itemName, Pageable.unpaged())
                .stream()
                .map(this::mapToSearchDto)
                .collect(Collectors.toList());
    }

    // 공정 검색
    @Transactional(readOnly = true)
    public List<Operations> searchOperations(String keyword) {
        return operationsRepository.findAll().stream()
                .filter(op -> op.getCode().contains(keyword)
                        || op.getName().contains(keyword)
                        || (op.getDescription() != null && op.getDescription().contains(keyword)))
                .collect(Collectors.toList());
    }

    // ==============================
    // 3️⃣ 등록용 DTO 변환
    // ==============================
    private SalesItemRegisterDto mapToRegisterDto(SalesItem item) {
        List<SalesItemOperation> operations =
                salesItemOperationRepository.findBySalesItem_SalesItemIdOrderBySeqAsc(item.getSalesItemId());

        List<OperationDto> operationDtos = operations.stream()
                .map(o -> new OperationDto(
                        o.getOperation().getOperationId(),
                        o.getOperation().getCode(),
                        o.getOperation().getName(),
                        o.getOperation().getDescription(),
                        o.getOperation().getStandardTime()
                ))
                .collect(Collectors.toList());

        List<Long> operationIds = operationDtos.stream()
                .map(OperationDto::getOperationId)
                .collect(Collectors.toList());

        return new SalesItemRegisterDto(
                item.getPartner() != null ? item.getPartner().getPartnerId() : null,
                item.getItemName(),
                item.getItemCode(),
                item.getPrice(),
                item.getColor(),
                item.getClassification(),
                item.getCoatingMethod(),
                item.getRemark(),
                operationIds
        );
    }

    // ==============================
    // 4️⃣ 조회용 DTO 변환
    // ==============================
    private SalesItemSearchDto mapToSearchDto(SalesItem item) {
        return new SalesItemSearchDto(
                item.getPartner() != null ? item.getPartner().getPartnerId() : null,
                item.getItemCode(),
                item.getItemName(),
                item.getClassification(),
                item.getPrice(),
                item.getCoatingMethod(),
                item.getRemark(),
                item.getActive() // 거래상태
        );
    }

    // ==============================
    // 5️⃣ 거래 상태 변경
    // ==============================
    @Transactional
    public void resumeTrade(Long id) {
        SalesItem item = salesItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setActive(true);
        salesItemRepository.save(item);
    }

    @Transactional
    public void stopTrade(Long id) {
        SalesItem item = salesItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setActive(false);
        salesItemRepository.save(item);
    }
}
