//package com.mini_mes_3m_back.controller;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/raw/inbound")
//@RequiredArgsConstructor
//public class RawInboundController {
//    private final RawInboundService rawInboundService;
//
//    @PostMapping("/register")
//    public ResponseEntity<String> registerInbound(@RequestBody RawItemInboundRequest request) {
//        rawInboundService.registerInbound(request);
//        return ResponseEntity.ok("입고 등록 완료");
//    }
//
//}
