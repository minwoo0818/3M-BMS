package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.operation.OperationStatusDto;
import com.mini_mes_3m_back.dto.operation.OperationRequestDto;
import com.mini_mes_3m_back.dto.operation.OperationResponseDto;
import com.mini_mes_3m_back.entity.Operations;
import com.mini_mes_3m_back.repository.OperationsRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.boot.beanvalidation.GroupsPerOperation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OperationsStatusService {

    private final OperationsRepository operationsRepository;

    // ✅ 1. 공정 상태 목록 조회
    @Transactional(readOnly = true)
    public List<OperationResponseDto> getAllOperations() {
        return operationsRepository.findAll().stream()
                .map(OperationResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // ✅ 2. 공정 수정 (공정명 변경 포함)
    public List<OperationResponseDto> updateOperation(Long id, OperationRequestDto dto) {
        Operations operations = operationsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공정을 찾을 수 없습니다."));

        if (operations.getStatus() == Operations.OperationStatus.COMPLETED) {
            throw new IllegalStateException("완료된 공정은 수정할 수 없습니다.");
        }

        operations.update(
                dto.getCode(),
                dto.getName(),
                dto.getDescription(),
                dto.getStandardTime(),
                dto.getStatus() != null ? dto.getStatus() : operations.getStatus()
        );

        // Dirty Checking으로 자동 반영됨, save() 생략 가능
        return getAllOperations(); // 수정 후 전체 리스트 반환
    }

    // ✅ 3. 공정 순서 변경
    public List<OperationResponseDto> updateOrder(List<OperationStatusDto> orderList) {
        for (OperationStatusDto dto : orderList) {
            Operations op = operationsRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("공정을 찾을 수 없습니다."));
            op.setOperationOrder(dto.getOrder());
        }

        return getAllOperations(); // 순서 변경 후 전체 리스트 반환
    }

    // ✅ 4. 다음 공정 시작
    public List<OperationResponseDto> startNextOperation(Long id) {
        Operations op = operationsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공정을 찾을 수 없습니다."));

        if (op.getStatus() == Operations.OperationStatus.COMPLETED) {
            throw new IllegalStateException("이미 완료된 공정입니다.");
        }

        op.setStartTime(OffsetDateTime.now());
        op.setStatus(Operations.OperationStatus.IN_PROGRESS);

        return getAllOperations(); // 상태 변경 후 전체 리스트 반환
    }
}
