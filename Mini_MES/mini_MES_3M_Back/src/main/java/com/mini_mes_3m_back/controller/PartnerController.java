package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.Partner.PartnerRegisterRequestDto; // 변경된 패키지와 DTO 이름 반영!
import com.mini_mes_3m_back.dto.Partner.PartnerPartialResponseDto; // 변경된 패키지와 DTO 이름 반영!
import com.mini_mes_3m_back.service.PartnerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/info/partners")
public class PartnerController {

    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    // 거래처 등록 엔드포인트
    @PostMapping
    public ResponseEntity<PartnerRegisterRequestDto> registerPartner(@RequestBody PartnerRegisterRequestDto request) { // DTO 이름 변경!
        try {
            PartnerRegisterRequestDto response = partnerService.registerPartner(request); // DTO 이름 변경!
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 모든 거래처 일부 조회 엔드포인트 - @RequestParam으로 partnerType 받기 재추가!
    // GET 요청 예시: /api/partners?partnerType=customer 또는 /api/partners?partnerType=supplier
    @GetMapping
    public ResponseEntity<List<PartnerPartialResponseDto>> getAllPartnersPartial( // DTO 이름 변경!
                                                                                  @RequestParam(required = false) String partnerType) { // required = false로 선택적 파라미터 지정
        List<PartnerPartialResponseDto> partners = partnerService.getAllPartnersPartial(partnerType); // DTO 이름 및 인자 전달!
        return ResponseEntity.ok(partners);
    }

    // 특정 거래처 상세 조회 엔드포인트
    @GetMapping("/{partnerId}")
    public ResponseEntity<PartnerRegisterRequestDto> getPartnerDetailById(@PathVariable Long partnerId) { // DTO 이름 변경!
        try {
            PartnerRegisterRequestDto partner = partnerService.getPartnerDetailById(partnerId); // DTO 이름 변경!
            return ResponseEntity.ok(partner);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}