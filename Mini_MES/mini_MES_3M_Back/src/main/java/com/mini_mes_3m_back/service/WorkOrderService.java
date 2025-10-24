package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.Etc.WorkOrderResponseDto;
import com.mini_mes_3m_back.entity.SalesInbound;
import com.mini_mes_3m_back.repository.SalesInboundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final SalesInboundRepository salesInboundRepository;

    @Transactional(readOnly = true)
    public WorkOrderResponseDto getWorkOrder(Long inboundId) {
        SalesInbound entity = salesInboundRepository.findById(inboundId)
                .orElseThrow(() -> new RuntimeException("해당 작업 지시서를 찾을 수 없습니다. id=" + inboundId));

        return WorkOrderResponseDto.builder()
                .lotNo(entity.getInboundLOTNum())
                .customerName(entity.getItem().getPartner().getName())
                .itemName(entity.getItem().getItemName())
                .itemCode(entity.getItem().getItemCode())
                .classification(entity.getItem().getClassification())
                .color(entity.getItem().getColor())
                .coatingMethod(entity.getItem().getCoatingMethod())
                .note(entity.getItem().getRemark())
                .routingInfo(entity.getItem().getRouting())
                .photoPath(entity.getItem().getImagePath())
                .build();

    }
}
