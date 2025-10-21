package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.OperationRequestDto;
import com.mini_mes_3m_back.dto.OperationResponseDto;
import com.mini_mes_3m_back.service.OperationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/info/routing")         // 공통 URL 경로 설정
@RequiredArgsConstructor                     // final 필드를 이용한 생성자 주입
public class OperationController {

    // Service 계층 의존성 주입
    private final OperationService operationService;

    // 1. 공정 등록 (POST)
    @PostMapping
    public ResponseEntity<?> registerProcess(@Valid @RequestBody OperationRequestDto operationRequestDto)
    {
        // @Valid: Dto 유효성검사
        // 서비스 계층으로 등록 요청
        try
        {
            operationService.registerNewProcess(operationRequestDto);

            return ResponseEntity.status(HttpStatus.CREATED)
                                 .body("{\"message\": \"공정이 성공적으로 등록되었습니다.\"}");
        }
        catch (IllegalArgumentException e)
        {
            // 공정 코드 중복 에러 발생 시
            return ResponseEntity.status(HttpStatus.CONFLICT)
                                 .body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    // 2. 공정 코드 중복 확인 (GET)
    @GetMapping("/check-code")
    public ResponseEntity<Boolean> checkCodeDuplication(@RequestParam String code)
    {
        boolean isDuplicate = operationService.isCodeDuplicate(code);

        // true 또는 false 값을 JSON 형태로 반화 (HTTP 200 OK)
        return  ResponseEntity.ok(isDuplicate);
    }

    // 3. 공정 조회 및 검색 (GET)
    @GetMapping
    public ResponseEntity<Page<OperationResponseDto>> getProcesses(
            @RequestParam(defaultValue = "1") int page,

            //페이지 당 항목 수 (기본값 10)
            @RequestParam(defaultValue = "10") int limit,

            //검색 타입: 전체, 공정코드, 공정명
            @RequestParam(defaultValue = "전체") String searchType,

            //실제 검색어 (선택 사항)
            @RequestParam(required = false) String searchTerm
    )
    {
        // 🚨 수정된 부분: 1-base 페이지 번호를 0-base 인덱스로 변환
        int pageIndex = page - 1;

        // **음수 체크 추가:** 혹시 모를 오류를 방지하기 위해 0 미만인 경우 0으로 설정
        if (pageIndex < 0) {
            pageIndex = 0;
        }

        // Service 에서 페이징, 검색 처리를 수행한 Page<OperationsResponseDto>를 반환합니다.
        Page<OperationResponseDto> processPage =
                operationService.getProcesses(page, limit, searchType,searchTerm);

        // Spring 이 Page 객체를 JSON으로 직렬화할 때,
        //데이터 목록, 총 페이지 수, 현재 페이지 등 페이징 정보를 모두 포함하여 반환합니다.
        return ResponseEntity.ok(processPage);
    }

    // 4. 공정 수정 (PUT/PATCH)
    @PutMapping("/{operationId}")
    public ResponseEntity<?> updateProcess(
            @PathVariable Long operationId,
            @Valid @RequestBody OperationRequestDto operationRequestDto)
    {
        try {
            operationService.updateProcess(operationId,operationRequestDto);

            // 200 OK 와 메세지 반환
            return ResponseEntity.ok("{\"message\": \" 공정이 성공적으로 수정되었습니다.\"}");
        }
        catch (IllegalArgumentException e) {
            // ID를 찾을 수 없거나 중복 코드가 발생한 경우
            return ResponseEntity.status(HttpStatus.BAD_REQUEST) // 400 Bad Request
                    .body("{\"message\": \" + e.getMessage() + \"}");
        }
    }

    // 5. 공정 삭제 (DELETE /api/operations/{operationId})
    @DeleteMapping("/{operationId}")
    public ResponseEntity<?> deleteProcess(@PathVariable Long operationId) {
        try {
            operationService.deleteProcess(operationId);

            // 204 No Content 또는 200 OK와 메시지 반환
            // 여기서는 클라이언트 피드백을 위해 200 OK와 메시지를 반환합니다.
            return ResponseEntity.ok("{\"message\": \"공정이 성공적으로 삭제되었습니다.\"}");
        } catch (IllegalArgumentException e) {
            // ID를 찾을 수 없는 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND) // 404 Not Found
                    .body("{\"message\": \"삭제할 공정을 찾을 수 없습니다.\"}");
        }
    }
}
