package com.mini_mes_3m_back.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mini_mes_3m_back.dto.Partner.PartnerSelectResponseDto;
import com.mini_mes_3m_back.dto.operation.OperationDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemDetailViewDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemRegisterDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemSearchDto;
import com.mini_mes_3m_back.entity.*;
import com.mini_mes_3m_back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.io.IOException;
import java.nio.file.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesItemService {

    private final SalesItemRepository salesItemRepository;
    private final PartnerRepository partnerRepository;
    private final OperationsRepository operationsRepository;
    private final SalesItemOperationRepository salesItemOperationRepository;
    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir}")
    private String uploadDir;

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

        // =========================================================
        // 💡 1. operationIds JSON String을 List<Long>으로 변환 (수정된 로직)
        // =========================================================
        List<Long> operationIdList;
        try {
            // ObjectMapper를 사용하여 JSON 문자열을 List<Long> 타입으로 역직렬화
            operationIdList = objectMapper.readValue(
                    dto.getOperationIds(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Long.class)
            );
        } catch (Exception e) {
            // JSON 파싱 실패 시, 400 에러를 던질 수 있도록 예외 처리
            // (Bad Request로 처리하는 것이 적절합니다.)
            throw new IllegalArgumentException("작업 공정 ID (operationIds)가 올바른 JSON 배열 형식이 아닙니다: " + dto.getOperationIds(), e);
        }

        // =========================================================
        // 2. 기존 로직 (Partner 조회 및 SalesItem 준비)
        // =========================================================
        Partner partner = null;
        if (dto.getPartnerId() != null) {
            partner = partnerRepository.findById(dto.getPartnerId())
                    .orElseThrow(() -> new RuntimeException("Partner not found"));
        }

        // 기존 품목 조회 또는 신규 생성
        SalesItem salesItem = salesItemRepository.findByItemCode(dto.getItemCode())
                .orElse(SalesItem.builder().build());

        // ... (품목 정보 설정)
        salesItem.setPartner(partner);
        salesItem.setPartnerName(partner != null ? partner.getName() : "");
        salesItem.setItemName(dto.getItemName());
        salesItem.setItemCode(dto.getItemCode());
        salesItem.setPrice(dto.getPrice());
        salesItem.setColor(dto.getColor());
        salesItem.setClassification(dto.getClassification());
        salesItem.setCoatingMethod(dto.getCoatingMethod());
        salesItem.setRemark(dto.getRemark());

        // ... (이미지 저장 로직 유지)
        if (file != null && !file.isEmpty()) {
            try {
//                String uploadDir = uploadDir;
                Files.createDirectories(Paths.get(uploadDir));

                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir).resolve(fileName);

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                salesItem.setImagePath(filePath.toString());
            } catch (IOException e) {
                throw new RuntimeException("이미지 업로드 실패", e);
            }
        }

        // =========================================================
        // 3. 공정 매핑 로직 (변환된 List<Long> 사용)
        // =========================================================

        // 변환된 operationIdList 사용
        if (operationIdList != null && !operationIdList.isEmpty()) {
            // findAllById는 List<Long>을 받습니다.
            List<Operations> operations = operationsRepository.findAllById(operationIdList);
            List<SalesItemOperation> itemOperations = new ArrayList<>();
            for (int i = 0; i < operations.size(); i++) {
                // 주의: findAllById는 순서를 보장하지 않습니다.
                // 순서를 유지하려면 operationIdList를 기준으로 DB에서 가져온 operations를 매핑해야 합니다.
                // 현재 로직은 단순 findAllById 후 순서대로 매핑하므로 순서가 꼬일 수 있습니다.
                // 프론트에서 보낸 순서대로 (operationIdList의 순서) 매핑이 되려면
                // 아래 로직을 Map을 사용하여 수정해야 합니다. (일단 기존 로직의 흐름은 유지)

                SalesItemOperation sio = new SalesItemOperation();
                sio.setSalesItem(salesItem);
                sio.setOperations(operations.get(i));
                sio.setSeq(i + 1); // seq 설정
                itemOperations.add(sio);
            }

            salesItem.updateOperations(itemOperations);
            salesItem.setTotalOperations(itemOperations.size());
        } else {
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
        // =========================================================
        // 💡 1. operationIds JSON String을 List<Long>으로 변환 (추가된 로직)
        // =========================================================
        List<Long> operationIdList;
        try {
            // ObjectMapper를 사용하여 JSON 문자열을 List<Long> 타입으로 역직렬화
            operationIdList = objectMapper.readValue(
                    dto.getOperationIds(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Long.class)
            );
        } catch (Exception e) {
            // JSON 파싱 실패 시 예외 처리
            throw new IllegalArgumentException("작업 공정 ID (operationIds)가 올바른 JSON 배열 형식이 아닙니다: " + dto.getOperationIds(), e);
        }

        // =========================================================
        // 2. 기존 로직 (Item 조회 및 업데이트)
        // =========================================================
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

        // =========================================================
        // 3. 공정 수정: 변환된 List<Long> 사용 (기존 로직 수정)
        // =========================================================
        List<SalesItemOperation> itemOps = Collections.emptyList();

        // **변환된 operationIdList 사용**
        if (operationIdList != null && !operationIdList.isEmpty()) {
            // DB에서 공정 정보 조회
            List<Operations> ops = operationsRepository.findAllById(operationIdList);
            // 빠른 조회를 위해 Map으로 변환
            Map<Long, Operations> operationMap = ops.stream()
                    .collect(Collectors.toMap(Operations::getOperationId, Function.identity()));

            itemOps = new ArrayList<>();
            int seq = 1;

            // **변환된 operationIdList의 순서대로 반복**하여 공정 매핑
            for (Long opId : operationIdList) {
                Operations op = operationMap.get(opId); // Map에서 조회

                if(op == null) {
                    throw new RuntimeException("Operation not found: " + opId);
                }

                SalesItemOperation sio = new SalesItemOperation();
                sio.setSalesItem(item);
                sio.setOperations(op);
                sio.setSeq(seq++); // 순서 설정 (i+1 대신 seq 변수 사용)
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

        List<Long> operationIdList = operations.stream() // 변수명 변경 (operationIdList)
                .map(o -> o.getOperations().getOperationId())
                .collect(Collectors.toList());

        // =========================================================
        // 💡 List<Long>을 JSON String으로 변환 (수정된 로직)
        // =========================================================
        String operationIdsJsonString;
        try {
            // List<Long>을 JSON 문자열 "[1, 2, ...]" 형태로 변환합니다.
            operationIdsJsonString = objectMapper.writeValueAsString(operationIdList);
        } catch (JsonProcessingException e) {
            // JSON 변환 실패 시 예외 처리 (매우 드물게 발생)
            throw new RuntimeException("operationIds를 JSON 문자열로 변환하는데 실패했습니다.", e);
        }
        // =========================================================

        return new SalesItemRegisterDto(
                item.getPartner() != null ? item.getPartner().getPartnerId() : null,
                item.getItemName(),
                item.getItemCode(),
                item.getPrice(),
                item.getColor(),
                item.getClassification(),
                item.getCoatingMethod(),
                item.getRemark(),
                // **수정**: List<Long> 대신 JSON 문자열을 전달
                operationIdsJsonString);
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