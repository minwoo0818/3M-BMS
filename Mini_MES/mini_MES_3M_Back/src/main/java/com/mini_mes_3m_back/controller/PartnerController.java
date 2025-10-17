// src/main/java/com/mini_mes_3m_back/controller/PartnerController.java
package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.Partner.PartnerRegisterRequestDto;
import com.mini_mes_3m_back.dto.Partner.PartnerPartialResponseDto;
import com.mini_mes_3m_back.dto.Partner.PartnerUpdateStatusRequestDto;
import com.mini_mes_3m_back.service.PartnerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException; // 추가!
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError; // 추가!

import jakarta.validation.Valid; // 추가!

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/partners")
public class PartnerController {

    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    // 거래처 등록 엔드포인트
    @PostMapping
    public ResponseEntity<PartnerRegisterRequestDto> registerPartner(
            @Valid @RequestBody PartnerRegisterRequestDto request) { // <-- @Valid 추가!
        try {
            PartnerRegisterRequestDto response = partnerService.registerPartner(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Service 계층에서 발생한 비즈니스 로직 에러 (예: 중복 업체명) 처리
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DTO 유효성 검사 실패 시 예외 처리 핸들러 추가
    @ResponseStatus(HttpStatus.BAD_REQUEST) // HTTP 상태 코드를 400으로 설정
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors; // 필드별 에러 메시지를 담은 Map을 반환
    }


    // 모든 거래처 일부 조회 엔드포인트
    @GetMapping
    public ResponseEntity<List<PartnerPartialResponseDto>> getAllPartnersPartial(
            @RequestParam(required = false) String partnerType) {
        List<PartnerPartialResponseDto> partners = partnerService.getAllPartnersPartial(partnerType);
        return ResponseEntity.ok(partners);
    }

    // 특정 거래처 상세 조회 엔드포인트
    @GetMapping("/{partnerId}")
    public ResponseEntity<PartnerRegisterRequestDto> getPartnerDetailById(@PathVariable Long partnerId) {
        try {
            PartnerRegisterRequestDto partner = partnerService.getPartnerDetailById(partnerId);
            return ResponseEntity.ok(partner);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 거래처 상태 (active) 업데이트 엔드포인트 추가
    // PUT 또는 PATCH를 사용할 수 있으며, 부분 업데이트이므로 PATCH가 더 의미론적입니다.
    @PatchMapping("/{partnerId}/status")
    public ResponseEntity<PartnerPartialResponseDto> updatePartnerStatus(
            @PathVariable Long partnerId,
            @Valid @RequestBody PartnerUpdateStatusRequestDto request) { // DTO 유효성 검사
        try {
            PartnerPartialResponseDto updatedPartner = partnerService.updatePartnerStatus(partnerId, request.getActive());
            return ResponseEntity.ok(updatedPartner); // 200 OK와 함께 업데이트된 정보 반환
        } catch (IllegalArgumentException e) {
            // 존재하지 않는 거래처 ID이거나 다른 비즈니스 로직 에러
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND); // 404 Not Found
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}