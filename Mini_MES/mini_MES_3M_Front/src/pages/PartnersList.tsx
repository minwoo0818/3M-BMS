import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useCommonStyles } from '../style/useCommonStyles'; 
import { useNavigate } from "react-router-dom";
import type { PartnerListRowData, SearchField } from '../types/partner'; // PartnerListRowData 사용!
import { getPartnersPartial } from '../apis/partnersApi'; // API 함수 import

const ITEMS_PER_PAGE = 5; // 페이지당 항목 수

const PartnersList: React.FC = () => {
  const navigate = useNavigate();
  const styles = useCommonStyles(); // useCommonStyles 훅을 사용하여 스타일을 가져옴

  const [partners, setPartners] = useState<PartnerListRowData[]>([]); // PartnerListRowData 배열
  const [tab, setTab] = useState<"customer" | "supplier">("customer"); // 'customer' 또는 'supplier'
  const [searchField, setSearchField] = useState<SearchField>("total");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowPartnerId, setHoveredRowPartnerId] = useState<number | null>(null); // partnerId로 hover 상태 관리
  const [filteredAndSearchedPartners, setFilteredAndSearchedPartners] = useState<PartnerListRowData[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  // --- API 호출 함수 (useCallback으로 최적화) ---
  const fetchPartners = useCallback(async (type: 'customer' | 'supplier') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPartnersPartial(type); // PartnerListRowData[] 형태로 받아옴
      setPartners(data); // 백엔드에서 받은 실제 데이터로 상태 업데이트
    } catch (err: any) {
      console.error('거래처 목록을 불러오는데 실패했습니다:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        setError(`데이터 로드 실패: ${errorDetail}`);
      } else {
        setError('거래처 데이터를 불러오는 중 오류가 발생했습니다.');
      }
      setPartners([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 탭이 변경되거나 컴포넌트 마운트 시 데이터를 다시 불러오도록 useEffect 추가
  useEffect(() => {
    fetchPartners(tab);
  }, [tab, fetchPartners]);

  // 거래 상태 토글 핸들러 (현재는 프론트엔드 상태만 변경. 실제로는 백엔드 API 호출 필요)
  const togglePartnerStatus = useCallback((targetPartnerId: number) => { // partnerId 사용
    // TODO: 백엔드에 PUT/PATCH 요청을 보내서 실제 DB를 업데이트하는 로직 추가 필요
    // 예: updatePartnerStatus(targetPartnerId, !currentStatus);
    setPartners((prev) =>
      prev.map((p) => (p.partnerId === targetPartnerId ? { ...p, active: !p.active } : p))
    );
  }, []);
  
  // 검색 및 필터링 로직 (프론트엔드에서 검색하는 로직은 유지)
  const applySearchAndFilter = useCallback(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    const filtered = partners.filter((p) => {
      if (!keyword) return true;

      if (searchField === "total") {
        return (
          p.name.toLowerCase().includes(keyword) || // p.name 사용 (PartnerListRowData의 name 필드)
          p.representativeName.toLowerCase().includes(keyword)
        );
      }
      const searchSource = p[searchField as 'name' | 'representativeName']; // PartnerListRowData 타입에 맞춤 (name 필드)
      return searchSource.toLowerCase().includes(keyword);
    });

    setFilteredAndSearchedPartners(filtered);
    setCurrentPage(1); // 검색/필터 변경 시 페이지 초기화
  }, [partners, searchKeyword, searchField]);

  // partners 데이터가 변경될 때마다 필터링 재실행
  useEffect(() => {
      applySearchAndFilter();
  }, [partners, applySearchAndFilter]);

  // 검색 버튼 클릭 핸들러 (폼 제출)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applySearchAndFilter();
  };

  // --- 페이징 로직 ---
  const totalPages = Math.ceil(filteredAndSearchedPartners.length / ITEMS_PER_PAGE);
  
  const currentPartners = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSearchedPartners.slice(startIndex, endIndex);
  }, [filteredAndSearchedPartners, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);
  
  // --- 테이블 렌더링 함수 ---
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr key="loading">
          <td colSpan={7} style={styles.td}>데이터를 불러오는 중입니다...</td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr key="error">
          <td colSpan={7} style={styles.td}>{error}</td>
        </tr>
      );
    }
    if (currentPartners.length === 0) {
      return (
        <tr key="no-data">
          <td colSpan={7} style={styles.td}>조회된 거래처가 없습니다.</td>
        </tr>
      );
    }

    return currentPartners.map((partner, index) => {
        const isHovered = hoveredRowPartnerId === partner.partnerId; // partnerId 사용
        
        return (
            <tr 
                key={partner.partnerId} // partnerId를 key로 사용
                style={{...styles.tableRow, ...(isHovered ? styles.tdHover : {})}}
                onMouseEnter={() => setHoveredRowPartnerId(partner.partnerId)} // partnerId 사용
                onMouseLeave={() => setHoveredRowPartnerId(null)}
            >
                <td style={{ ...styles.td, width: '5%', ...styles.tdCenter }}>
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                
                {/* 업체명 (링크 역할) - 클릭 시 partnerId로 상세 조회 이동 */}
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            textDecoration: 'underline',
                            fontSize: '1em',
                            color: '#3b82f6', // primary color
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1.5,
                        }}
                        onClick={() => navigate(`/info/partners/${partner.partnerId}`)} // partnerId로 상세 조회 이동
                    >
                        {partner.name} {/* partner.name 사용 */}
                    </button>
                </td>
                
                <td style={{ ...styles.td, width: '10%', ...styles.tdCenter }}>{partner.brNum}</td>
                <td style={{ ...styles.td, width: '25%', textAlign: 'left' }}>{partner.address}</td>
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>{partner.representativeName}</td>
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>{partner.representativePhone}</td>
                
                {/* 거래상태 (액션 버튼) */}
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>
                    <button
                        style={styles.actionButton(partner.active ? '#ed6c02' : '#2e7d32')} 
                        onClick={() => togglePartnerStatus(partner.partnerId)} // partnerId 사용
                    >
                        {partner.active ? "거래종료" : "거래재개"}
                    </button>
                </td>
            </tr>
        );
    });
  };

  // --- 탭 스타일 정의 ---
  const tabButtonStyled = (isActive: boolean) => ({
    padding: '12px 20px',
    fontSize: '1em', // 폰트 크기 조정
    cursor: 'pointer',
    fontWeight: isActive ? '700' : '400',
    color: isActive ? '#3b82f6' : '#6b7280',
    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
    transition: 'all 0.2s',
    backgroundColor: 'transparent',
    border: 'none',
  });
  
  // --- 메인 렌더링 ---
  return (
    <div style={styles.container}>
      {/* 1. 제목 */}
      <h1 style={styles.header}>거래처 목록</h1>

      {/* 2. 검색 및 필터 */}
      <form onSubmit={handleSearchSubmit} style={styles.searchContainer}>
        <div style={styles.searchGroup}>
          {/* 검색 필터 Select */}
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as SearchField)}
            style={styles.searchSelect}
          >
            <option value="total">전체</option>
            <option value="name">업체명</option> {/* name 사용 */}
            <option value="representativeName">담당자명</option>
          </select>

          {/* 검색어 Input */}
          <input
            type="text"
            placeholder="업체명 혹은 담당자로 검색해주세요."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ ...styles.input, border: 'none', flexGrow: 1 }}
          />
        </div>

        {/* 검색 Button (돋보기 아이콘) */}
        <button type="submit" style={styles.searchButton} aria-label="검색">
            <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
        {/* 신규 거래처 등록 버튼 제거 */}
      </form>

      {/* 3. 탭 */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '16px' }}>
        <button
          style={tabButtonStyled("customer" === tab)} // 스타일 함수 호출
          onClick={() => setTab("customer")}
        >
          수주품 거래처
        </button>
        <button
          style={tabButtonStyled("supplier" === tab)} // 스타일 함수 호출
          onClick={() => setTab("supplier")}
        >
          원자재 거래처
        </button>
      </div>

      {/* 총 조회 건수 */}
      <p style={{fontSize: '14px', color: '#4b5563', fontWeight: '500', marginBottom: '8px'}}>
        총 <span style={{color: '#3b82f6', fontWeight: 'bold'}}>{filteredAndSearchedPartners.length.toLocaleString()}</span>건 조회됨
      </p>

      {/* 4. 데이터 테이블 */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={{ ...styles.th(true, false), width: '5%' }}>번호</th>
              <th style={{ ...styles.th(false, false), width: '15%' }}>업체명</th>
              <th style={{ ...styles.th(false, false), width: '10%' }}>사업자등록번호</th>
              <th style={{ ...styles.th(false, false), width: '25%' }}>주소</th>
              <th style={{ ...styles.th(false, false), width: '15%' }}>담당자</th>
              <th style={{ ...styles.th(false, false), width: '15%' }}>연락처</th>
              <th style={{ ...styles.th(false, true), width: '15%' }}>거래상태</th>
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* 5. 페이징 UI 구현 */}
      <div style={styles.paginationContainer}>
        <button 
          style={styles.pageButton(false)} // useCommonStyles의 pageButton 사용
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>

        {/* 페이지 번호 렌더링 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            const maxPagesToShow = 5;
            if (totalPages <= maxPagesToShow) return true;

            if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
              return page <= maxPagesToShow; 
            }
            if (currentPage > totalPages - Math.floor(maxPagesToShow / 2)) {
              return page > totalPages - maxPagesToShow; 
            }
            return page >= currentPage - Math.floor(maxPagesToShow / 2) && page <= currentPage + Math.floor(maxPagesToShow / 2); 
          })
          .map((page) => (
            <button
              key={page} 
              style={styles.pageButton(page === currentPage)} // useCommonStyles의 pageButton 사용
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

        <button 
          style={styles.pageButton(false)} // useCommonStyles의 pageButton 사용
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default PartnersList;