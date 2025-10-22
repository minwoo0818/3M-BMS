package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.Partner.*;
import com.mini_mes_3m_back.service.PartnerService;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;
import jakarta.validation.Valid;

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

    @PostMapping
    public ResponseEntity<PartnerRegisterRequestDto> registerPartner(
            @Valid @RequestBody PartnerRegisterRequestDto request) {
        PartnerRegisterRequestDto response = partnerService.registerPartner(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

    @GetMapping
    public ResponseEntity<List<PartnerPartialResponseDto>> getAllPartnersPartial(
            @RequestParam(required = false) String partnerType) {
        List<PartnerPartialResponseDto> partners = partnerService.getAllPartnersPartial(partnerType);
        return ResponseEntity.ok(partners);
    }

    @GetMapping("/{partnerId}/detail")
    public ResponseEntity<PartnerDetailResponseDto> getPartnerDetailById(@PathVariable Long partnerId) {
        PartnerDetailResponseDto partner = partnerService.getPartnerDetailById(partnerId);
        return ResponseEntity.ok(partner);
    }

    @PatchMapping("/{partnerId}/status")
    public ResponseEntity<PartnerPartialResponseDto> updatePartnerStatus(
            @PathVariable Long partnerId,
            @Valid @RequestBody PartnerUpdateStatusRequestDto request) {
        PartnerPartialResponseDto updatedPartner = partnerService.updatePartnerStatus(partnerId, request.getActive());
        return ResponseEntity.ok(updatedPartner);
    }

    @PutMapping("/{partnerId}")
    public ResponseEntity<PartnerDetailResponseDto> updatePartner(
            @PathVariable Long partnerId,
            @Valid @RequestBody PartnerDetailUpdateRequestDto request) {
        PartnerDetailResponseDto updatedPartner = partnerService.updatePartner(partnerId, request);
        return ResponseEntity.ok(updatedPartner);
    }

    @GetMapping("/select")
    public ResponseEntity<List<PartnerPartialResponseDto>> getActivePartners() {
        List<PartnerPartialResponseDto> partners = partnerService.getAllActivePartners();
        return ResponseEntity.ok(partners);
    }

    // --- 활성화된 특정 타입의 파트너 목록 조회 ---
    @GetMapping("/active-by-type")
    public ResponseEntity<List<PartnerListRowDataDto>> getActivePartnersByType(
            @RequestParam("partnerType") String partnerType) {
        try {
            List<PartnerListRowDataDto> partners = partnerService.getActivePartnersByType(partnerType);
            return ResponseEntity.ok(partners);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
