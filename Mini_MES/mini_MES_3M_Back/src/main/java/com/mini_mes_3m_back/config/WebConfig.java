package com.mini_mes_3m_back.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Spring Boot WebMvcConfigurer 예시
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프론트엔드가 http://localhost:8080/images/sales/파일이름.png 로 요청하면
        //         실제 C:\3M-BMS\Mini_MES/upload_Sales_Item\ 경로에서 파일을 찾습니다.
        registry.addResourceHandler("/uploads")
                .addResourceLocations(uploadDir);
    }
}