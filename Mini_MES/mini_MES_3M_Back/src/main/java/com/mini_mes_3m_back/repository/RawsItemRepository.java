// src/main/java/com/mini_mes_3m_back/repository/RawsItemRepository.java (새로 생성!)
package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.RawsItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RawsItemRepository extends JpaRepository<RawsItem, Long> {
    Optional<RawsItem> findByItemCode(String itemCode); // 품목번호로 조회
    List<RawsItem> findByActive(Boolean active); // 활성화 여부로 조회
    // 품목명, 품목번호, 제조사 등 검색을 위한 메서드 추가 가능
}