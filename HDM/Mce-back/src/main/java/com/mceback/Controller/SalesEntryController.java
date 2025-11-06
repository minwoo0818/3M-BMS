package com.mceback.Controller;

import com.mceback.dto.SalesEntryDataDto;
import com.mceback.entity.SalesEntry;
import com.mceback.service.SalesEntryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/sales-entries")
public class SalesEntryController {

    private final SalesEntryService salesEntryService; // 서비스 주입

    @Autowired
    public SalesEntryController(SalesEntryService salesEntryService) {
        this.salesEntryService = salesEntryService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createSalesEntry(@RequestBody SalesEntryDataDto salesEntryDataDto) {
        try {
            SalesEntry savedEntry = salesEntryService.saveSalesEntry(salesEntryDataDto);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "판매 이력 및 고객 위치 정보가 성공적으로 저장되었습니다.");
            response.put("savedId", savedEntry.getId()); // 저장된 ID 반환
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "판매 이력 저장 중 오류 발생: " + e.getMessage());
            // 개발 단계에서는 자세한 에러 메시지를 포함할 수 있지만, 운영 환경에서는 보안에 유의해야 해.
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}