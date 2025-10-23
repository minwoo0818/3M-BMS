package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.Partner.PartnerSelectResponseDto;
import com.mini_mes_3m_back.dto.operation.OperationDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemDetailViewDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemRegisterDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemSearchDto;
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

        // 기존 품목 조회 또는 신규 생성 (SalesItem 엔티티 수정으로 operations는 null이 아님)
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
                String uploadDir = "C:\\Users\\codehows\\Desktop\\3M-BMS\\Mini_MES\\upload_Sales_Item";
                Files.createDirectories(Paths.get(uploadDir));

                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir).resolve(fileName);

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                salesItem.setImagePath(filePath.toString());
            } catch (IOException e) {
                throw new RuntimeException("이미지 업로드 실패", e);
            }
        }

        // 공정 매핑 로직: 기존의 setOperations()를 대체
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

            // ⭐ setOperations 대신 헬퍼 메서드 사용
            salesItem.updateOperations(itemOperations);
            salesItem.setTotalOperations(itemOperations.size());
        } else {
            // 공정이 없다면 빈 리스트로 갱신
            salesItem.updateOperations(Collections.emptyList());
            salesItem.setTotalOperations(0);
        }

        SalesItem saved = salesItemRepository.saveAndFlush(salesItem);
        return mapToRegisterDto(saved);
    }

    // 등록용: 활성 거래처만
    @Transactional(readOnly = true)
    public List<PartnerSelectResponseDto> getActivePartners() {
        return partnerRepository.findByActiveTrue()
                .stream()
                .map(p -> new PartnerSelectResponseDto(p.getPartnerId(), p.getName()))
                .collect(Collectors.toList());
    }

    // 상세조회용: 전체 거래처
    @Transactional(readOnly = true)
    public List<PartnerSelectResponseDto> getAllPartners() {
        return partnerRepository.findAll()
                .stream()
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
        List<SalesItemOperation> itemOps = Collections.emptyList();

        if (dto.getOperationIds() != null && !dto.getOperationIds().isEmpty()) {
            List<Operations> ops = operationsRepository.findAllById(dto.getOperationIds());
            itemOps = new ArrayList<>();
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
        }

        // ⭐ setOperations 대신 헬퍼 메서드 사용
        item.updateOperations(itemOps);
        item.setTotalOperations(itemOps.size());


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

    private SalesItemRegisterDto mapToRegisterDto(SalesItem item) {
        List<SalesItemOperation> operations = salesItemOperationRepository
                .findBySalesItem_SalesItemIdOrderBySeqAsc(item.getSalesItemId());

        List<Long> operationIds = operations.stream()
                .map(o -> o.getOperations().getOperationId())
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

    private SalesItemDetailViewDto mapToDetailDto(SalesItem item) {
        // item.getOperations()는 이제 null이 아님을 보장합니다.
        List<OperationDto> operationDtos = item.getOperations().stream()
                .map(o -> new OperationDto(
                        o.getOperations().getOperationId(),
                        o.getOperations().getCode(),
                        o.getOperations().getName(),
                        o.getOperations().getDescription(),
                        o.getOperations().getStandardTime()
                )).collect(Collectors.toList());

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
        );
    }
}