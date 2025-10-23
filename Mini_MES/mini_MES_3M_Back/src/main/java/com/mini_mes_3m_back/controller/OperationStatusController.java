package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.operation.OperationRequestDto;
import com.mini_mes_3m_back.dto.operation.OperationResponseDto;
import com.mini_mes_3m_back.dto.operation.OperationStatusDto;
import com.mini_mes_3m_back.service.OperationsStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/info/routing")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class OperationStatusController {

    private final OperationsStatusService operationsStatusService;

    // 공정 상태 목록 조회
    @GetMapping("/status")
    public ResponseEntity<List<OperationResponseDto>> getAllOperations() {
        return ResponseEntity.ok(operationsStatusService.getAllOperations());
    }

    // 공정 수정
    @PutMapping("/status/{operationId}")
    public ResponseEntity<List<OperationResponseDto>> updateOperation(
            @PathVariable Long id,
            @RequestBody @Valid OperationRequestDto dto
    ) {
        return ResponseEntity.ok(operationsStatusService.updateOperation(id, dto));
    }

    // 공정 순서 변경
    @PutMapping("/order")
    public ResponseEntity<List<OperationResponseDto>> updateOrder(@RequestBody List<OperationStatusDto> orderList) {
        return ResponseEntity.ok(operationsStatusService.updateOrder(orderList));
    }

    // 다음 공정 시작
    @PatchMapping("/start/{operationId}")
    public ResponseEntity<List<OperationResponseDto>> startNextOperation(@PathVariable Long id) {
        return ResponseEntity.ok(operationsStatusService.startNextOperation(id));
    }

}

