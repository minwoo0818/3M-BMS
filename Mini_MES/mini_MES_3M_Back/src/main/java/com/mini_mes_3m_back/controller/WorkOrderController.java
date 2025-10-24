package com.mini_mes_3m_back.controller;

import com.mini_mes_3m_back.dto.Etc.WorkOrderResponseDto;
import com.mini_mes_3m_back.service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/work-order")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping("/{inboundId}")
    public WorkOrderResponseDto getWorkOrder(@PathVariable Long inboundId) {
        return workOrderService.getWorkOrder(inboundId);
    }
}
