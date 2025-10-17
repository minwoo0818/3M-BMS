import React, { useState, useMemo, useCallback, useEffect } from "react";
// 제공된 useCommonStyles를 import 합니다.
import { useCommonStyles } from '../style/useCommonStyles'; 

// DataGrid에서 사용했던 GridPaginationModel 타입은 더 이상 사용하지 않습니다.
import { useNavigate } from "react-router-dom";

// 파트너 데이터 타입 정의
interface PartnerData {
  id: number;
  partnerName: string;
  brNum: string;
  bossName: string;
  bossPhone: string;
  address: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  remark: string;
  type: "customer" | "supplier";
  active: boolean;
}

// 검색 필드 타입 정의
type SearchField = "total" | "partnerName" | "representativeName";

// 더미 데이터
const dummyData: PartnerData[] = [
  {
    id: 1,
    partnerName: "코드하우스",
    brNum: "123-456789",
    bossName: "박준형",
    bossPhone: "055-123-4567",
    address: "경남 창원시 창원대로123",
    representativeName: "영업부 부장 박준형",
    representativePhone: "010-1234-5678",
    representativeEmail: "jhpark@codehouse.com",
    remark: "주요 고객사",
    type: "customer",
    active: true,
  },
  {
    id: 2,
    partnerName: "구트하우스",
    brNum: "987-654321",
    bossName: "김지훈",
    bossPhone: "051-987-6543",
    address: "경남 창원시 창원대로456",
    representativeName: "품질관리 홍석민 대리",
    representativePhone: "010-9876-5432",
    representativeEmail: "jhkim@goothouse.com",
    remark: "원자재 단가 협의 필요",
    type: "supplier",
    active: false,
  },
  {
    id: 3,
    partnerName: "고투하우스",
    brNum: "123-456789",
    bossName: "홍석민",
    bossPhone: "055-123-4567",
    address: "경남 창원시 창원대로123",
    representativeName: "영업부 부장 류민우",
    representativePhone: "010-1234-5678",
    representativeEmail: "jhpark@codehouse.com",
    remark: "주요 고객사",
    type: "customer",
    active: true,
  },
];

const ITEMS_PER_PAGE = 5; // 페이지당 항목 수

const PartnersList: React.FC = () => {
  const navigate = useNavigate();
  // useCommonStyles 훅을 사용하여 모든 스타일을 가져옵니다.
  const styles = useCommonStyles();

  const [partners, setPartners] = useState<PartnerData[]>(dummyData);
  const [tab, setTab] = useState<"customer" | "supplier">("customer");
  const [searchField, setSearchField] = useState<SearchField>("total");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [filteredAndSearchedPartners, setFilteredAndSearchedPartners] = useState<PartnerData[]>([]);

  // 거래 상태 토글 핸들러
  const togglePartnerStatus = useCallback((id: number) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  }, []);
  
  // 검색 및 필터링 로직
  const applySearchAndFilter = useCallback(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    const filtered = partners.filter((p) => {
      // 1. 탭 필터링
      if (p.type !== tab) return false;

      // 2. 검색어 필터링
      if (!keyword) return true; 

      if (searchField === "total") {
        return (
          p.partnerName.toLowerCase().includes(keyword) ||
          p.representativeName.toLowerCase().includes(keyword)
        );
      }
      // searchField가 partnerName 또는 representativeName일 경우
      const searchSource = p[searchField as 'partnerName' | 'representativeName'];
      return searchSource.toLowerCase().includes(keyword);
    });

    setFilteredAndSearchedPartners(filtered);
    setCurrentPage(1); // 검색/필터 변경 시 페이지 초기화
  }, [partners, tab, searchKeyword, searchField]);

  // Tab 또는 partners 데이터가 변경될 때마다 필터링 재실행
  useEffect(() => {
      applySearchAndFilter();
  }, [tab, partners, applySearchAndFilter]);

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
    if (currentPartners.length === 0) {
      return (
        <tr key="no-data">
          <td colSpan={7} style={styles.td}>
            조회된 거래처가 없습니다.
          </td>
        </tr>
      );
    }

    return currentPartners.map((partner, index) => {
        const isHovered = hoveredRowId === partner.id;
        
        return (
            <tr 
                key={partner.id} 
                style={{...styles.tableRow, ...(isHovered ? styles.tdHover : {})}}
                onMouseEnter={() => setHoveredRowId(partner.id)}
                onMouseLeave={() => setHoveredRowId(null)}
            >
                <td style={{ ...styles.td, width: '5%', ...styles.tdCenter }}>
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                
                {/* 업체명 (링크 역할) */}
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            textDecoration: 'underline',
                            fontSize: '20px',
                            color: '#3b82f6', // primary color
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1.5,
                        }}
                        onClick={() => navigate(`/info/partners/${partner.id}`)}
                    >
                        {partner.partnerName}
                    </button>
                </td>
                
                <td style={{ ...styles.td, width: '10%', ...styles.tdCenter }}>{partner.brNum}</td>
                <td style={{ ...styles.td, width: '25%', textAlign: 'left' }}>{partner.address}</td>
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>{partner.representativeName}</td>
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>{partner.representativePhone}</td>
                
                {/* 거래상태 (액션 버튼) */}
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>
                    <button
                        // active: true(거래 중)이면 경고색(종료), false(거래 종료)면 성공색(재개)
                        style={styles.actionButton(partner.active ? '#ed6c02' : '#2e7d32')} 
                        onClick={() => togglePartnerStatus(partner.id)}
                    >
                        {partner.active ? "거래종료" : "거래재개"}
                    </button>
                </td>
            </tr>
        );
    });
  };

  // --- 탭 스타일 정의 (useCommonStyles에 없으므로 인라인으로 대체) ---
  const tabStyle = (isActive: boolean) => ({
    padding: '12px 20px',
    fontSize: '20px',
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
            <option value="partnerName">업체명</option>
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

        {/* 검색 Button (돋보기 아이콘 대체) */}
        <button type="submit" style={styles.searchButton} aria-label="검색">
            <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
      </form>

      {/* 3. 탭 */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '16px' }}>
        <button
          style={tabStyle("customer" === tab)}
          onClick={() => setTab("customer")}
        >
          수주품 거래처
        </button>
        <button
          style={tabStyle("supplier" === tab)}
          onClick={() => setTab("supplier")}
        >
          원자재 거래처
        </button>
      </div>
      
      <p style={{fontSize: '14px', color: '#4b5563', fontWeight: '500', marginBottom: '8px'}}>총 <span style={{color: '#3b82f6', fontWeight: 'bold'}}>{filteredAndSearchedPartners.length.toLocaleString()}</span>건 조회됨</p>

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
          style={styles.pageButton(false)}
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
              style={styles.pageButton(page === currentPage)}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

        <button 
          style={styles.pageButton(false)}
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