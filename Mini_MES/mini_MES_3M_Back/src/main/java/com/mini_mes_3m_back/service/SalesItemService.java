package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.*;
import com.mini_mes_3m_back.dto.Partner.PartnerSelectResponseDto;
import com.mini_mes_3m_back.entity.*;
import com.mini_mes_3m_back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesItemService {

    private final SalesItemRepository salesItemRepository;
    private final PartnerRepository partnerRepository;
    private final OperationsRepository operationsRepository;
    private final SalesItemOperationRepository salesItemOperationRepository;

    // -------------------
    // 1️⃣ 등록 / 수정
    // -------------------
    @Transactional
    public void updateSalesItemActive(Long salesItemId, Boolean active) {
        SalesItem item = salesItemRepository.findById(salesItemId)
                .orElseThrow(() -> new RuntimeException("SalesItem not found: " + salesItemId));
        item.setActive(active);
        salesItemRepository.save(item);
    }

    @Transactional
    public SalesItemRegisterDto createSalesItemWithImage(SalesItemRegisterDto dto, MultipartFile file) {
        Partner partner = null;
        if (dto.getPartnerId() != null) {
            partner = partnerRepository.findById(dto.getPartnerId())
                    .orElseThrow(() -> new RuntimeException("Partner not found"));
        }

        SalesItem salesItem = salesItemRepository.findByItemCode(dto.getItemCode())
                .orElse(SalesItem.builder().build());

        // ... (품목 정보 설정 및 이미지 저장 로직은 유지)
        salesItem.setPartner(partner);
        salesItem.setPartnerName(partner != null ? partner.getName() : "");
        salesItem.setItemName(dto.getItemName());
        salesItem.setItemCode(dto.getItemCode());
        salesItem.setPrice(dto.getPrice());
        salesItem.setColor(dto.getColor());
        salesItem.setClassification(dto.getClassification());
        salesItem.setCoatingMethod(dto.getCoatingMethod());
        salesItem.setRemark(dto.getRemark());

        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = "uploads/sales-items";
                Files.createDirectories(Paths.get(uploadDir));

                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir).resolve(fileName);

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                salesItem.setImagePath(filePath.toString());
            } catch (IOException e) {
                throw new RuntimeException("이미지 업로드 실패", e);
            }
        }

        // 공정 매핑 로직 유지...
        if (dto.getOperationIds() != null && !dto.getOperationIds().isEmpty()) {
            List<Operations> operations = operationsRepository.findAllById(dto.getOperationIds());
            List<SalesItemOperation> itemOperations = new ArrayList<>();
            for (int i = 0; i < operations.size(); i++) {
                SalesItemOperation sio = new SalesItemOperation();
                sio.setSalesItem(salesItem);
                sio.setOperations(operations.get(i));
                sio.setSeq(i + 1); // seq 설정
                itemOperations.add(sio);
            }
            salesItem.setOperations(itemOperations);
            salesItem.setTotalOperations(itemOperations.size());
        }

        SalesItem saved = salesItemRepository.saveAndFlush(salesItem);
        return mapToRegisterDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PartnerSelectResponseDto> getAllActivePartners() {
        return partnerRepository.findByActiveTrue().stream()
                .map(p -> new PartnerSelectResponseDto(p.getPartnerId(), p.getName()))
                .collect(Collectors.toList());
    }

    // -------------------
    // 2️⃣ 목록 조회
    // -------------------
    @Transactional(readOnly = true)
    public Page<SalesItemDetailViewDto> getSalesItems(String keyword, Pageable pageable) {
        Page<SalesItem> page = salesItemRepository.searchByKeyword(keyword, pageable);
        return page.map(this::mapToDetailDto);
    }

    // 추가: 검색에 사용될 전체 리스트 조회 메서드
    @Transactional(readOnly = true)
    public List<SalesItemSearchDto> getAllSalesItemsForSearch() {
        return salesItemRepository.findAll().stream()
                .map(this::mapToSearchDto)
                .collect(Collectors.toList());
    }

    // -------------------
    // 3️⃣ 상세조회
    // -------------------
    // Controller가 SalesItemDetailViewDto를 사용하도록 통일했으므로 이 메서드를 사용합니다.
    @Transactional(readOnly = true)
    public SalesItemDetailViewDto getSalesItemDetail(Long id) {
        SalesItem item = salesItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 품목을 찾을 수 없습니다."));
        return mapToDetailDto(item);
    }

    // --------------------
    // 수정 (상세조회 페이지 내에서만)
    // --------------------
    @Transactional
    public SalesItemRegisterDto updateSalesItem(Long id, SalesItemRegisterDto dto) {
        SalesItem item = salesItemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("SalesItem not found: " + id));

        // ... (업데이트 로직은 유지)
        item.setItemName(dto.getItemName());
        item.setItemCode(dto.getItemCode());
        item.setPrice(dto.getPrice());
        item.setColor(dto.getColor());
        item.setClassification(dto.getClassification());
        item.setCoatingMethod(dto.getCoatingMethod());
        item.setRemark(dto.getRemark());

        // 공정 수정: 기존 연결 제거 후 재생성
        if (item.getOperations() != null && !item.getOperations().isEmpty()) {
            salesItemOperationRepository.deleteAll(item.getOperations());
            item.getOperations().clear();
        }

        if (dto.getOperationIds() != null && !dto.getOperationIds().isEmpty()) {
            List<Operations> ops = operationsRepository.findAllById(dto.getOperationIds());
            List<SalesItemOperation> itemOps = new ArrayList<>();
            for (int i = 0; i < dto.getOperationIds().size(); i++) {
                Long opId = dto.getOperationIds().get(i);
                Operations op = ops.stream().filter(o -> o.getOperationId().equals(opId)).findFirst()
                        .orElseThrow(() -> new RuntimeException("Operation not found: " + opId));
                SalesItemOperation sio = new SalesItemOperation();
                sio.setSalesItem(item);
                sio.setOperations(op);
                sio.setSeq(i + 1);
                itemOps.add(sio);
            }
            item.setOperations(itemOps);
            item.setTotalOperations(itemOps.size());
        }

        SalesItem saved = salesItemRepository.save(item);
        return mapToRegisterDto(saved);
    }

    // --------------------
    // 거래상태 토글
    // --------------------
    @Transactional
    public SalesItemDetailViewDto toggleTradeStatus(Long id) {
        SalesItem item = salesItemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("SalesItem not found: " + id));
        Boolean prev = item.getActive();
        item.setActive(prev == null ? Boolean.FALSE : !prev);
        SalesItem saved = salesItemRepository.save(item);
        return mapToDetailDto(saved);
    }

    // ===================
    // DTO 매핑
    // ===================

    // ⚠️ 중복된 첫 번째 mapToRegisterDto는 제거하고, 두 번째 mapToRegisterDto만 남깁니다.
    private SalesItemRegisterDto mapToRegisterDto(SalesItem item) {
        List<SalesItemOperation> operations = salesItemOperationRepository
                .findBySalesItem_SalesItemIdOrderBySeqAsc(item.getSalesItemId());

        List<Long> operationIds = operations.stream()
                .map(o -> o.getOperations().getOperationId()) // ⚠️ o.getOperation() -> o.getOperations()로 수정
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
                operationIds);
    }

    // ⚠️ Controller가 이 DTO를 사용하는 경우, 이름 충돌을 피하기 위해 메서드명을 변경했습니다.
    // 기존 getSalesItemDetail(Long id)와 이름은 같지만 반환 DTO가 다른 메서드가 존재했었음.
    // Controller에서 SalesItemDetailViewDto를 사용하도록 통일했으므로, 이 메서드를 Private DTO 매퍼로 변환합니다.
    /*
    @Transactional(readOnly = true)
    public SalesItemDetailDto getSalesItemDetail(Long id) {
        SalesItem item = salesItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        // ... (로직)
    }
    */


    private SalesItemDetailViewDto mapToDetailDto(SalesItem item) {
        List<OperationDto> operationDtos = item.getOperations() == null ? Collections.emptyList() :
                item.getOperations().stream()
                        .map(o -> new OperationDto(
                                o.getOperations().getOperationId(),
                                o.getOperations().getCode(),
                                o.getOperations().getName(),
                                o.getOperations().getDescription(),
                                o.getOperations().getStandardTime()
                        )).collect(Collectors.toList());

        // ⚠️ DTO 생성자 괄호 누락 및 인자 순서 정리
        return new SalesItemDetailViewDto(
                item.getSalesItemId(),
                item.getPartner() != null ? item.getPartner().getPartnerId() : null,
                item.getPartnerName(),
                item.getItemCode(),
                item.getItemName(),
                item.getPrice(),
                item.getColor(),
                item.getClassification(),
                item.getCoatingMethod(),
                item.getRemark(),
                item.getActive(),
                operationDtos
        );
    }

    private SalesItemSearchDto mapToSearchDto(SalesItem item) {
        // ⚠️ DTO 인자가 중복되거나 누락된 부분을 정리했습니다.
        return new SalesItemSearchDto(
                item.getSalesItemId(),
                item.getPartner() != null ? item.getPartner().getPartnerId() : null,
                item.getPartner() != null ? item.getPartner().getName() : null,
                item.getItemCode(),
                item.getItemName(),
                item.getClassification(),
                item.getPrice(),
                item.getCoatingMethod(),
                item.getRemark(),
                item.getActive()
                // operationDtos가 DTO 정의에 없다면 제거합니다.
        );
    }
}