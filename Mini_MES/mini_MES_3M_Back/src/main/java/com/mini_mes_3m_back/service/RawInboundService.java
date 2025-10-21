//package com.mini_mes_3m_back.service;
//
//import com.mini_mes_3m_back.entity.RawInbound;
//import com.mini_mes_3m_back.entity.RawsItem;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class RawInboundService {
//    private final RawInboundRepository rawInboundRepository;
//    private final RawsItemRepository rawsItemRepository;
//
//    public void registerInbound(RawItemInboundRequest request) {
//        // 1. 품목 조회
//        RawsItem rawsItem = rawsItemRepository.findById(request.getItem_id())
//                .orElseThrow(() -> new RuntimeException("해당 품목이 존재하지 않습니다"));
//
//        // 2. 입고 엔티티 생성
//        RawInbound inbound = new RawInbound();
//        inbound.setRawItem(rawsItem);
//        inbound.setQty(request.getQty());
//        inbound.setInbDate(request.getInb_date());
//        inbound.setMfgDate(request.getMfg_date());
//        inbound.setManufacturer(rawsItem.getManufacturer()); // 제조사 자동 세팅
//
//        // 3. 저장
//        rawInboundRepository.save(inbound);
//    }
//
//}
