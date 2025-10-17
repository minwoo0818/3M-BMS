package com.mini_mes_3m_back.repository;

import com.mini_mes_3m_back.entity.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
// ⭐️ JpaSpecificationExecutor를 추가하여 Service의 동적 검색 (getProcesses)을 지원합니다.
public interface OperationRepository extends JpaRepository<Operation, Long>, JpaSpecificationExecutor<Operation>
{
    // [조회, 수정] 공정 코드로 엔티티를 찾는 메서드
    Optional<Operation> findByCode(String code);

    /**
     * [등록] 공정 코드 중복 확인을 위한 메서드 (효율적인 중복 체크).
     * @param code 확인할 공정 코드
     * @return 중복 여부 (true: 중복됨, false: 사용 가능)
     */
    boolean existsByCode(String code);
}