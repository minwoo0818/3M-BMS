package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.SalesOutbound.SalesOutboundListDto;
import com.mini_mes_3m_back.dto.SalesOutbound.SalesOutboundRegDto;
import com.mini_mes_3m_back.entity.SalesInbound;
import com.mini_mes_3m_back.entity.SalesOutbound;
import com.mini_mes_3m_back.repository.SalesInboundRepository;
import com.mini_mes_3m_back.repository.SalesOutboundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class SalesOutboundService {

    private final SalesInboundRepository salesInboundRepository;
    private final SalesOutboundRepository salesOutboundRepository;

    @Transactional
    public void registerNewSalesOutbound(SalesOutboundRegDto dto) {
        // 1. 입고 항목 조회
        SalesInbound inbound = salesInboundRepository.findById(dto.getInboundId())
                .orElseThrow(() -> new IllegalArgumentException("입고 항목을 찾을 수 없습니다."));

        // 2. 출고 가능 여부 확인
        if (inbound.getIsCancelled()) {
            throw new IllegalArgumentException("이미 취소된 입고 항목입니다.");
        }

        if (inbound.getRemainingQty() <= 0) {
            throw new IllegalArgumentException("이미 모든 수량이 출고된 항목입니다.");
        }

        if (dto.getQty() > inbound.getRemainingQty()) {
            throw new IllegalArgumentException("출고 수량이 잔여 수량보다 많습니다.");
        }

        // 3. 출고 문서번호 생성
        String outboundNum = generateOutboundNum();

        // 4. 출고 정보 저장
        SalesOutbound outbound = new SalesOutbound();
        outbound.setOutboundOUTNum(outboundNum);
        outbound.setInbound(inbound);
        outbound.setQty(dto.getQty());
        outbound.setShippedAt(dto.getShippedAt());
        outbound.setStatus(true);
        salesOutboundRepository.save(outbound);

        // 5. 입고 항목 상태 업데이트 → 조회에서 제외되도록
        int remaining = inbound.getRemainingQty() - dto.getQty();
        inbound.setRemainingQty(remaining);

        // 6. 잔여 수량이 0이면 출고 완료 처리
        if (remaining <= 0) {
            inbound.setIsOutboundProcessed(true);
        }

        salesInboundRepository.save(inbound);
    }

    // 출고 문서번호 생성: OUT-yyyyMMdd-001 형식
    private String generateOutboundNum() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String latestNum = salesOutboundRepository.findLatestOutboundNum(today);

        int nextSeq = 1;
        if (latestNum != null) {
            String[] parts = latestNum.split("-");
            nextSeq = Integer.parseInt(parts[2]) + 1;
        }

        return String.format("OUT-%s-%03d", today, nextSeq);
    }


    public Page<SalesOutboundListDto> getSalesInboundList(int page, int limit, String searchType, String searchTerm) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "receivedAt"));
        Page<SalesInbound> inboundPage;

        switch (searchType) {
            case "입고번호":
                inboundPage = salesInboundRepository.findByInboundLOTNumContainingAndIsCancelledFalseAndIsOutboundProcessedFalse(searchTerm, pageable);
                break;
            case "거래처명":
                inboundPage = salesInboundRepository.findByItem_PartnerNameContainingAndIsCancelledFalseAndIsOutboundProcessedFalse(searchTerm, pageable);
                break;
            case "품목번호":
                inboundPage = salesInboundRepository.findByItem_ItemCodeContainingAndIsCancelledFalseAndIsOutboundProcessedFalse(searchTerm, pageable);
                break;
            case "품목명":
                inboundPage = salesInboundRepository.findByItem_ItemNameContainingAndIsCancelledFalseAndIsOutboundProcessedFalse(searchTerm, pageable);
                break;
            case "입고일자":
                LocalDate date = LocalDate.parse(searchTerm);
                inboundPage = salesInboundRepository.findByReceivedAtAndIsCancelledFalseAndIsOutboundProcessedFalse(date, pageable);
                break;
            case "입고수량":
                int qty = Integer.parseInt(searchTerm);
                inboundPage = salesInboundRepository.findByQtyAndIsCancelledFalseAndIsOutboundProcessedFalse(qty, pageable);
                break;
            default:
                inboundPage = salesInboundRepository.findByIsCancelledFalseAndIsOutboundProcessedFalse(pageable);
        }

        return inboundPage.map(SalesOutboundListDto::fromInbound);
    }

}

