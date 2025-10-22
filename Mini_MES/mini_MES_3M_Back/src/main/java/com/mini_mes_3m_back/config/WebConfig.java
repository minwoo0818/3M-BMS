//package com.mini_mes_3m_back.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class WebConfig {
//
//    @Bean
//    public WebMvcConfigurer corsConfigurer() {
//        return new WebMvcConfigurer() {
//            @Override
//            public void addCorsMappings(CorsRegistry registry) {
//                registry.addMapping("/api/**")
//                        .allowedOrigins("http://localhost:5173") // ✅ 프론트 주소
//                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                        .allowCredentials(true);
//            }
//        };
//    }
//}
//
//// Spring 설정 파일로 등록
//@Configuration
//public class WebConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        // 모든 경로에 대한 CORS 설정을 추가
//        registry.addMapping("/**")
//                // ⭐️ 프론트엔드 주소 (Vite 기본 포트 5173)를 허용합니다.
//                // 배포 환경에서는 실제 도메인으로 변경해야 합니다.
//                .allowedOrigins("http://localhost:5173")
//                // ⭐️ 모든 HTTP 메서드 허용 (GET, POST, PUT, DELETE 등)
//                .allowedMethods("*")
//                // ⭐️ 모든 헤더 허용 (Content-Type, Authorization 등)
//                .allowedHeaders("*")
//                // ⭐️ multipart/form-data 요청에 필수적일 수 있음
//                .allowCredentials(true)
//                // 3600초(1시간) 동안 Preflight 요청 캐싱
//                .maxAge(3600);
//    }
//}
