package com.mceback.service;

import com.mceback.dto.SalesEntryDataDto;
import com.mceback.entity.SalesEntry;
import com.mceback.repository.SalesEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 트랜잭션 관리

@Service
public class SalesEntryService {

    private final SalesEntryRepository salesEntryRepository;

    // 생성자 주입 (Spring 권장 방식)
    @Autowired
    public SalesEntryService(SalesEntryRepository salesEntryRepository) {
        this.salesEntryRepository = salesEntryRepository;
    }

    @Transactional // 메서드 실행 중 예외 발생 시 롤백
    public SalesEntry saveSalesEntry(SalesEntryDataDto salesEntryDataDto) {
        // DTO를 엔티티로 변환 (비즈니스 로직 포함 가능)
        SalesEntry salesEntry = new SalesEntry();
        salesEntry.setCustomerName(salesEntryDataDto.getCustomerName());
        salesEntry.setCustomerPhone(salesEntryDataDto.getCustomerPhone());
        salesEntry.setCustomerLatitude(salesEntryDataDto.getCustomerLatitude());
        salesEntry.setCustomerLongitude(salesEntryDataDto.getCustomerLongitude());
        salesEntry.setDrivingDistanceKm(salesEntryDataDto.getDrivingDistanceKm());
        // TODO: 다른 필드들도 DTO에서 엔티티로 복사 (예: salesEntry.setProductName(salesEntryDataDto.getProductName());)

        // 레파지토리를 통해 데이터베이스에 저장
        SalesEntry savedEntry = salesEntryRepository.save(salesEntry);

        return savedEntry; // 저장된 엔티티 반환
    }

}