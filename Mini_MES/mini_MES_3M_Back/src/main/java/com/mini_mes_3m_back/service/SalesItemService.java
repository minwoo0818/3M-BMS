package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.*;
import com.mini_mes_3m_back.entity.*;
import com.mini_mes_3m_back.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesItemService {

    private final SalesItemRepository salesItemRepository;
    private final PartnerRepository partnerRepository;
    private final OperationsRepository operationsRepository;
    private final SalesItemOperationRepository salesItemOperationRepository;

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

        // 이미지 파일 저장
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

        SalesItem saved = salesItemRepository.saveAndFlush(salesItem);
        return mapToRegisterDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SalesItemSearchDto> getAllSalesItemsForSearch() {
        return salesItemRepository.findAll().stream()
                .map(this::mapToSearchDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalesItemDetailDto getSalesItemDetail(Long id) {
        SalesItem item = salesItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        List<SalesItemOperation> operations =
                salesItemOperationRepository.findBySalesItem_SalesItemIdOrderBySeqAsc(id);

        List<OperationDto> operationDtos = operations.stream()
                .map(o -> new OperationDto(
                        o.getOperation().getOperationId(),
                        o.getOperation().getCode(),
                        o.getOperation().getName(),
                        o.getOperation().getDescription(),
                        o.getOperation().getStandardTime()
                ))
                .collect(Collectors.toList());

        return new SalesItemDetailDto(
                item.getSalesItemId(),
                item.getPartnerName(),
                item.getItemCode(),
                item.getItemName(),
                item.getClassification(),
                item.getPrice(),
                item.getColor(),
                item.getCoatingMethod(),
                item.getRemark(),
                item.getImagePath(),
                operationDtos
        );
    }

    private SalesItemRegisterDto mapToRegisterDto(SalesItem item) {
        List<SalesItemOperation> operations =
                salesItemOperationRepository.findBySalesItem_SalesItemIdOrderBySeqAsc(item.getSalesItemId());

        List<Long> operationIds = operations.stream()
                .map(o -> o.getOperation().getOperationId())
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
