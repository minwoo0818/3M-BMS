package com.mceback.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter@Setter
@Table(name = "sales_entries") // 데이터베이스 테이블명 지정
public class SalesEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary Key

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = true) // 전화번호는 선택 사항일 수도 있음
    private String customerPhone;

    @Column(nullable = true) // 위도 경도는 고객이 선택 안 할 수도 있으므로 nullable
    private Double customerLatitude;

    @Column(nullable = true)
    private Double customerLongitude;

    @Column(nullable = true, length = 50) // "1.23 km" 형태의 문자열을 저장
    private String drivingDistanceKm;

    // TODO: 여기에 다른 필요한 필드들을 추가해주세요.
    // 예: 상품명, 수량, 판매일자, 비고 등

    // 기본 생성자 (JPA에서는 필수)
    public SalesEntry() {
    }

    // 모든 필드를 받는 생성자 (편의를 위해)
    public SalesEntry(String customerName, String customerPhone, Double customerLatitude, Double customerLongitude, String drivingDistanceKm) {
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerLatitude = customerLatitude;
        this.customerLongitude = customerLongitude;
        this.drivingDistanceKm = drivingDistanceKm;
        // 다른 필드들도 여기에 초기화
    }

}