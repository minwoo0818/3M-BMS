package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.entity.Operations;
import com.mini_mes_3m_back.repository.OperationsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/operations")
public class OperationsController {

    private final OperationsRepository operationsRepository;

    // GET /api/operations?keyword=절단
    @GetMapping
    public List<Operations> searchOperations(@RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return operationsRepository.findAll();
        }
        return operationsRepository.findByCodeContainingIgnoreCaseOrNameContainingIgnoreCase(keyword, keyword);
    }
}
