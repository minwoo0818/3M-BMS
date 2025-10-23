package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.Partner.PartnerSelectResponseDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemDetailViewDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemRegisterDto;
import com.mini_mes_3m_back.dto.salesItem.SalesItemUpdateStatusRequestDto;
import com.mini_mes_3m_back.service.SalesItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sales-items")
public class SalesItemController {

    private final SalesItemService salesItemService;

    // 1. 등록: DTO 데이터와 파일 모두 처리 (Multipart 버전 수정)
    @PostMapping(
            // DTO 필드와 파일을 개별적으로 받는 경우에는 MediaType.MULTIPART_FORM_DATA_VALUE만 지정하는 것이 일반적입니다.
            consumes = { MediaType.MULTIPART_FORM_DATA_VALUE }
    )
    public ResponseEntity<SalesItemRegisterDto> createSalesItem(
            // **수정**: @RequestPart("data") 대신 @ModelAttribute를 사용하여 개별 폼 필드와 DTO를 바인딩합니다.
            // @ModelAttribute는 FormData의 개별 텍스트 필드를 DTO로 자동 매핑합니다.
            @ModelAttribute @Valid SalesItemRegisterDto dto,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        // 프론트에서 operationIds를 JSON 문자열로 보냈다면,
        // 서비스 계층에서는 이 필드를 List<Long>으로 변환하는 추가 로직이 필요할 수 있습니다.

        SalesItemRegisterDto result = salesItemService.createSalesItemWithImage(dto, file);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    // 2. 목록조회 (페이지네이션 + 검색)
    // 기존 List 반환 버전 대신, Page 반환 버전을 주력으로 남깁니다.
    @GetMapping
    public ResponseEntity<Page<SalesItemDetailViewDto>> getSalesItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(salesItemService.getSalesItems(keyword, pageable));
    }

    // 3. 상세조회
    // SalesItemDetailViewDto를 반환하는 버전을 주력으로 남깁니다. (DTO 이름 통일 필요)
    @GetMapping("/{id}")
    public ResponseEntity<SalesItemDetailViewDto> getSalesItemDetail(@PathVariable Long id) {
        // Service 메서드가 SalesItemDetailViewDto를 반환하도록 가정합니다.
        SalesItemDetailViewDto detail = salesItemService.getSalesItemDetail(id);
        return ResponseEntity.ok(detail);
    }

    // 4. 수정 (상세 페이지에서만 사용)
    @PutMapping("/{id}")
    public ResponseEntity<SalesItemRegisterDto> updateSalesItem(
            @PathVariable Long id,
            @RequestBody SalesItemRegisterDto dto) {
        return ResponseEntity.ok(salesItemService.updateSalesItem(id, dto));
    }

    // 5. 거래상태 토글
    @PutMapping("/{id}/toggle")
    public ResponseEntity<SalesItemDetailViewDto> toggleTradeStatus(@PathVariable Long id) {
        SalesItemDetailViewDto updated = salesItemService.toggleTradeStatus(id);
        return ResponseEntity.ok(updated);
    }

    // 6. 활성화 상태 업데이트 (active/inactive)
    @PutMapping("/{salesItemId}/active")
    public ResponseEntity<Void> updateActive(
            @PathVariable Long salesItemId,
            @RequestBody SalesItemUpdateStatusRequestDto requestDto) {
        salesItemService.updateSalesItemActive(salesItemId, requestDto.getActive());
        return ResponseEntity.ok().build();
    }
    // 등록용: 활성 거래처만
//    @GetMapping("/partners/active")
//    public ResponseEntity<List<PartnerSelectResponseDto>> getActivePartners() {
//        List<PartnerSelectResponseDto> partners = salesItemService.getActivePartners();
//        return ResponseEntity.ok(partners);
//    }

    // 상세조회용: 전체 거래처
    @GetMapping("/partners/all")
    public ResponseEntity<List<PartnerSelectResponseDto>> getAllPartners() {
        List<PartnerSelectResponseDto> partners = salesItemService.getAllPartners();
        return ResponseEntity.ok(partners);
    }

}