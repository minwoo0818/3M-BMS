package com.mini_mes_3m_back.service;

import com.mini_mes_3m_back.dto.OperationRequestDto;
import com.mini_mes_3m_back.dto.OperationResponseDto;
import com.mini_mes_3m_back.entity.Operation;
import com.mini_mes_3m_back.repository.OperationRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperationService {

    private final OperationRepository operationRepository;

    // 공정 코드 중복 확인 로직
    @Transactional(readOnly = true)
    public boolean isCodeDuplicate(String code) {
        return operationRepository.existsByCode(code);
    }

    // 새로운 공정 등록 로직
    @Transactional
    public void registerNewProcess(OperationRequestDto dto) {
        // 1. 중복 확인 (2중 체크)
        if (isCodeDuplicate(dto.getCode())) {
            throw new IllegalArgumentException("이미 존재하는 공정 코드입니다." + dto.getCode());
        }

        // 2. Dto -> Entity 변환 및 저장
        Operation newOperation = Operation.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .processContent(dto.getProcessContent())
                .processTime(dto.getProcessTime())
                .build();
        operationRepository.save(newOperation);
    }

    // 공정 목록 조회 및 검색 (페이징 포함)
    @Transactional(readOnly = true)
    public Page<OperationResponseDto> getProcesses(int page, int limit,  String searchType, String searchTerm) {

        // Spring Data JPA의 Pageable은 0부터 시작하므로, 프론트의 1-base 페이지를 0-base로 변환
        // 정렬 기준은 DB ID(operationId) 오름차순
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.ASC, "operationId"));

        // 1. 동적 검색을 위한 Specification 생성
        Specification<Operation> spec = buildSearchSpecification(searchType, searchTerm);

        // 2. Repository에서 검색 및 페이징된 결과 조회
        Page<Operation> entityPage = operationRepository.findAll(spec, pageable);

        // 3. Entity Page를 Response DTO Page로 변환
        List<OperationResponseDto> dtoList = entityPage.getContent().stream()
                .map(OperationResponseDto::fromEntity)
                .collect(Collectors.toList());

        // 최종적으로 DTO 목록과 페이징 정보를 포함한 PageImpl 반환
        return new PageImpl<>(dtoList, pageable, entityPage.getTotalElements());
    }

    /**
     * JpaSpecificationExecutor를 위한 동적 검색 조건 빌더
     */
    private Specification<Operation> buildSearchSpecification(String searchType, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty() || "전체".equals(searchType)) {
            // 검색어 없거나 "전체" 검색 시, 필터링 없음
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        // 대소문자 구분 없이 검색을 위해 소문자 패턴 사용
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 검색 타입에 따른 LIKE 조건 추가 (SQL의 LIKE %검색어%)
            if ("공정코드".equals(searchType)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("code")), searchPattern));
            } else if ("공정명".equals(searchType)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern));
            }

            // 모든 조건을 AND로 묶어서 반환
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    // 4. 공정 수정 로직
    // ----------------------------------------------------
    @Transactional
    public void updateProcess(Long operationId, OperationRequestDto dto) {
        // 1. ID로 기존 엔티티 조회 (없으면 예외 발생)
        Operation existingOperation = operationRepository.findById(operationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공정 ID입니다: " + operationId));

        // 2. 공정 코드가 변경되었고, 그 코드가 다른 공정과 중복되는지 확인
        if (!existingOperation.getCode().equals(dto.getCode())) {
            if (operationRepository.existsByCode(dto.getCode())) {
                throw new IllegalArgumentException("이미 존재하는 공정 코드입니다: " + dto.getCode());
            }
        }

        // 3. Entity의 update 로직 호출 (Setter 대신 메서드를 통해 안전하게 업데이트)
        // 💡 주의: Operations Entity에 update() 메서드가 필요합니다.
        existingOperation.update(
                dto.getCode(),
                dto.getName(),
                dto.getProcessContent(),
                dto.getProcessTime()
        );

        // save()를 호출할 필요 없이, @Transactional에 의해 변경 감지(Dirty Checking)로 자동 업데이트됨.
    }

    // ----------------------------------------------------
    // 5. 공정 삭제 로직
    // ----------------------------------------------------
    @Transactional
    public void deleteProcess(Long operationId) {
        // 1. ID로 엔티티 존재 여부 확인
        if (!operationRepository.existsById(operationId)) {
            throw new IllegalArgumentException("삭제할 공정을 찾을 수 없습니다: " + operationId);
        }

        // 2. 삭제
        operationRepository.deleteById(operationId);
    }
}
