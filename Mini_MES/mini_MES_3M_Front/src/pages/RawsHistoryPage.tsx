import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// ==========================================================
// 1. 타입 및 상수 정의
// ==========================================================
type HistoryType = 'INBOUND' | 'OUTBOUND';

interface BaseHistoryItem {
  no: number;
  itemCode: string; // 품목 번호
  itemName: string; // 품목명
  vendorName: string; // 매입처명
  itemSpec: string; // 원자재규격 (양/단위)
  manufacturer: string; // 제조사
}

interface InboundItem extends BaseHistoryItem {
  inboundNo: string; // 입고 번호
  inboundQuantity: number; // 입고 수량
  totalQuantity: number; // 총량 (규격 X 수량)
  inboundDate: string; // 입고 일자
  manufactureDate: string; // 제조 일자
}

interface OutboundItem extends BaseHistoryItem {
  outboundNo: string; // 출고 번호
  outboundQuantity: number; // 출고 수량
  outboundDate: string; // 출고 일자
}

type HistoryItem = InboundItem | OutboundItem;
type CombinedItem = InboundItem | OutboundItem;

interface SearchOption {
  key: string;
  label: string;
}

const ITEMS_PER_PAGE = 10;

const INBOUND_SEARCH_OPTIONS: SearchOption[] = [
  { key: '전체', label: '전체' }, { key: 'vendorName', label: '매입처명' },
  { key: 'itemName', label: '품목명' }, { key: 'itemCode', label: '품목번호' },
  { key: 'inboundNo', label: '입고 번호' }, { key: 'inboundDate', label: '입고 일자' },
  { key: 'manufacturer', label: '제조사' },
];

const OUTBOUND_SEARCH_OPTIONS: SearchOption[] = [
  { key: '전체', label: '전체' }, { key: 'vendorName', label: '매입처명' },
  { key: 'itemName', label: '품목명' }, { key: 'itemCode', label: '품목번호' },
  { key: 'outboundNo', label: '출고 번호' }, { key: 'outboundDate', label: '출고 일자' },
  { key: 'manufacturer', label: '제조사' },
];

// 입고 더미 데이터 (35개)
const DUMMY_INBOUND_DATA: InboundItem[] = Array.from({ length: 35 }, (_, i) => {
  const specValue = 5 + (i % 5);
  return {
    no: i + 1,
    inboundNo: `IN-${20241001 + i}`,
    vendorName: `매입처 A${i % 5}`,
    itemCode: `ITM-00${i % 10}`,
    itemName: `마스킹 테이프 ${i + 1}`,
    itemSpec: `${specValue}kg/롤`,
    inboundQuantity: 100 + i,
    totalQuantity: specValue * (100 + i),
    inboundDate: `2024-10-${(i % 30) + 1 < 10 ? '0' : ''}${(i % 30) + 1}`,
    manufactureDate: `2024-09-${(i % 30) + 1 < 10 ? '0' : ''}${(i % 30) + 1}`,
    manufacturer: `제조사 ${i % 3 + 1}`,
  };
});

// 출고 더미 데이터 (28개)
const DUMMY_OUTBOUND_DATA: OutboundItem[] = Array.from({ length: 28 }, (_, i) => {
  const specValue = 3 + (i % 4);
  return {
    no: i + 1,
    outboundNo: `OUT-${20241001 + i}`,
    vendorName: `매입처 B${i % 4}`,
    itemCode: `ITM-00${i % 8}`,
    itemName: `포장지 ${i + 1}`,
    itemSpec: `${specValue}m/통`,
    outboundQuantity: 50 + i,
    outboundDate: `2024-10-${(i % 28) + 1 < 10 ? '0' : ''}${(i % 28) + 1}`,
    manufacturer: `제조사 ${i % 3 + 1}`,
  };
});

// ==========================================================
// 2. 스타일 정의
// ==========================================================
const baseStyles = {
  // 공통 스타일
  container: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    fontFamily: '"Inter", sans-serif',
  },

  // 테이블 관련 스타일
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    minWidth: '1200px',
  },
  th: (isFirst: boolean, isLast: boolean) => ({
    padding: '12px 16px',
    backgroundColor: '#1f2937',
    color: 'white',
    textAlign: 'center' ,
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '3px solid #111827',
    borderTopLeftRadius: isFirst ? '8px' : '0',
    borderTopRightRadius: isLast ? '8px' : '0',
  }),
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    color: '#374151',
  },
  tdCenter: {
    textAlign: 'center' ,
  },
  tdRight: {
    textAlign: 'right' ,
  },
  tdHover: {
    backgroundColor: '#f3f4f6',
    transition: 'background-color 0.2s',
  },

  // 헤더 스타일
  header: (type: HistoryType) => ({
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: `4px solid ${type === 'INBOUND' ? '#10b981' : '#f59e0b'}`, // 입고: Green, 출고: Amber
    color: '#1f2937',
  }),

  // 네비게이션 탭 스타일 추가
  navContainer: {
    display: 'flex',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: 'white',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  navTab: (isActive: boolean, type: HistoryType) => ({
    flexGrow: 1,
    padding: '12px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: isActive ? '700' : '500',
    color: isActive ? (type === 'INBOUND' ? '#10b981' : '#f59e0b') : '#6b7280',
    borderBottom: isActive 
      ? `3px solid ${type === 'INBOUND' ? '#10b981' : '#f59e0b'}` 
      : '3px solid transparent',
    transition: 'color 0.2s, border-bottom 0.2s',
    backgroundColor: isActive ? '#f9fafb' : 'white',
  }),

  // 검색 스타일 (이전과 동일)
  searchContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  searchGroup: {
    display: 'flex',
    flexGrow: 1,
    borderRadius: '8px',
    border: '2px solid #d1d5db',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  searchSelect: {
    padding: '10px 16px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none',
    borderRight: '1px solid #d1d5db',
  },
  searchInput: {
    padding: '10px 16px',
    border: 'none',
    outline: 'none',
    flexGrow: 1,
    fontSize: '14px',
  },
  searchButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  // 액션 버튼 스타일 (이전과 동일)
  actionButton: (color: string) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: color,
    transition: 'opacity 0.2s',
  }),

  // 엑셀 버튼 스타일 (이전과 동일)
  excelButton: {
    backgroundColor: '#059669', // Emerald green
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  // 페이징 스타일 (이전과 동일)
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '24px',
    gap: '8px',
  },
  pageButton: (isActive: boolean) => ({
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${isActive ? '#2563eb' : '#d1d5db'}`,
    backgroundColor: isActive ? '#2563eb' : 'white',
    color: isActive ? 'white' : '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '700' : '400',
    minWidth: '36px',
    textAlign: 'center',
    transition: 'background-color 0.2s, color 0.2s',
  }),
};


// ==========================================================
// 3. App 컴포넌트: useParams 패턴을 적용한 로직 수행
// ==========================================================

export default function App() {

  const styles = baseStyles;

  const { type: urlType } = useParams<{ type: string }>();

  // ******************************************************
  // currentHistoryType을 상태로 관리하여, URL 파라미터 변경(탭 클릭) 시
  // 컴포넌트를 강제로 재렌더링하여 데이터와 UI를 변경합니다.
  // ******************************************************
  const currentHistoryType: HistoryType = urlType?.toUpperCase() === 'OUTBOUND' ? 'OUTBOUND' : 'INBOUND';
  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKey, setSearchKey] = useState<string>('전체');

//   // URL 변경을 시뮬레이션하고 상태를 업데이트하는 핸들러
//   const handleTypeChange = useCallback((newType: HistoryType) => {
//     // 실제 React Router에서는 history.push('/path/' + newType.toLowerCase())를 사용합니다.
//     const newSegment: PathSegment = newType === 'INBOUND' ? 'inbound' : 'outbound';
    
//     // 현재 경로에서 마지막 세그먼트를 newSegment로 교체하거나 추가합니다.
//     const segments = window.location.pathname.toLowerCase().split('/').filter(p => p);
    
//     // 마지막 세그먼트가 'inbound' 또는 'outbound'이면 교체, 아니면 추가
//     let newPath = '';
//     if (segments.length > 0 && (segments[segments.length - 1] === 'inbound' || segments[segments.length - 1] === 'outbound')) {
//         segments[segments.length - 1] = newSegment;
//         newPath = '/' + segments.join('/');
//     } else {
//         newPath = window.location.pathname + (window.location.pathname.endsWith('/') ? '' : '/') + newSegment;
//     }

//     window.history.pushState({}, '', newPath); // URL 변경 시뮬레이션

//     // // 상태를 업데이트하여 컴포넌트 강제 재렌더링
//     // setCurrentHistoryType(newType); 

//     // 타입 변경 시 검색 조건 초기화
//     setSearchTerm('');
//     setSearchKey('전체');
//     setCurrentPage(1);

//   }, []);


  // --- 동적 설정 계산 (currentHistoryType에 의존) ---
  const { title, placeholder, searchOptions, dummyData } = useMemo(() => {
    if (currentHistoryType === 'INBOUND') {
      return {
        title: '원자재 품목 입고 이력조회',
        placeholder: '매입처명, 품목명, 품목번호, 입고 번호, 입고 일자로 검색해주세요',
        searchOptions: INBOUND_SEARCH_OPTIONS,
        dummyData: DUMMY_INBOUND_DATA as HistoryItem[],
      };
    } else {
      return {
        title: '원자재 품목 출고 이력조회',
        placeholder: '매입처명, 품목명, 품목번호, 출고 번호, 출고 일자로 검색해주세요',
        searchOptions: OUTBOUND_SEARCH_OPTIONS,
        dummyData: DUMMY_OUTBOUND_DATA as HistoryItem[],
      };
    }
  }, [currentHistoryType]);

  // 페이징 및 데이터 상태
  // currentHistoryType이 변경될 때 (dummyData가 변경됨) fullData도 업데이트
  const [fullData, setFullData] = useState<HistoryItem[]>(dummyData); 
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // currentHistoryType 변경 시 (라우팅 시뮬레이션) 데이터 업데이트
  useEffect(() => {
    setFullData(dummyData);
  }, [dummyData]); 

  // --- 검색 로직 ---
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    if (!lowerSearchTerm) {
      setFullData(dummyData);
      return;
    }

    const filtered = dummyData.filter(item => {
      let searchKeyStr: string | undefined = '';
      const isOutbound = currentHistoryType === 'OUTBOUND';

      if (searchKey === '전체') {
        const itemAsInbound = item as InboundItem;
        const itemAsOutbound = item as OutboundItem;

        // 전체 검색 필드 통합
        searchKeyStr = `${item.vendorName} ${item.itemCode} ${item.itemName} ${item.itemSpec} ${item.manufacturer} ${itemAsInbound.inboundNo || ''} ${itemAsOutbound.outboundNo || ''} ${itemAsInbound.inboundDate || ''} ${itemAsOutbound.outboundDate || ''} ${itemAsInbound.manufactureDate || ''}`;
      } else {
        // 개별 검색 키 처리
        if (searchKey.includes('Date')) {
          searchKeyStr = isOutbound ? (item as OutboundItem).outboundDate : (item as InboundItem).inboundDate;
        } else if (searchKey.includes('No')) {
          searchKeyStr = isOutbound ? (item as OutboundItem).outboundNo : (item as InboundItem).inboundNo;
        } else {
          searchKeyStr = (item as any)[searchKey]?.toString();
        }
      }

      return searchKeyStr?.toLowerCase().includes(lowerSearchTerm);
    });
    
    // 필터링 후 No. 재정렬
    const finalData = filtered.map((item, index) => ({...item, no: index + 1}));
    setFullData(finalData);
  }, [searchTerm, searchKey, dummyData, currentHistoryType]);

  // --- 페이징 로직 ---
  const totalPages = Math.ceil(fullData.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return fullData.slice(startIndex, endIndex);
  }, [fullData, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // --- 액션 핸들러 (수정/삭제) ---
  const handleAction = (item: CombinedItem, actionType: string) => {
    console.log(`${currentHistoryType}의 ${actionType} 버튼 클릭:`, item);
  };


  // --- 렌더링 함수 ---
  const renderTableBody = () => {
    const isOutbound = currentHistoryType === 'OUTBOUND';
    const colSpanCount = isOutbound ? 10 : 12;

    if (currentData.length === 0) {
      return (
        <tr key="no-data">
          <td colSpan={colSpanCount} style={{ ...styles.td, ...styles.tdCenter }}>
            조회된 데이터가 없습니다.
          </td>
        </tr>
      );
    }

    return currentData.map((item, index) => {
      const displayNo = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
      const uniqueKey = `${currentHistoryType}-${(item as InboundItem).inboundNo || (item as OutboundItem).outboundNo}-${item.no}`;
      const isHovered = hoveredRow === uniqueKey;
      
      const itemAsInbound = item as InboundItem;
      const itemAsOutbound = item as OutboundItem;

      return (
        <tr
          key={uniqueKey}
          style={isHovered ? styles.tdHover : {}}
          onMouseEnter={() => setHoveredRow(uniqueKey)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          {/* No. */}
          <td style={{...styles.td, ...styles.tdCenter, width: '3%'}}>{displayNo}</td>

          {/* 입고/출고 번호 */}
          <td style={{...styles.td, width: '10%', fontWeight: '500', ...styles.tdCenter}}>
            {isOutbound ? itemAsOutbound.outboundNo : itemAsInbound.inboundNo}
          </td>
          
          {/* 품목 번호 */}
          <td style={{...styles.td, width: '8%', ...styles.tdCenter}}>{item.itemCode}</td>
          
          {/* 품목명 */}
          <td style={{...styles.td, width: '12%', fontSize: '13px'}}>{item.itemName}</td>

          {/* 매입처명 */}
          <td style={{...styles.td, width: '10%'}}>{item.vendorName}</td>

          {/* 원자재규격(양/단위) */}
          <td style={{...styles.td, ...styles.tdCenter, width: '8%', fontSize: '13px'}}>{item.itemSpec}</td>

          {/* 입고/출고 수량 */}
          <td style={{...styles.td, ...styles.tdRight, width: '7%', color: isOutbound ? '#b91c1c' : '#059669'}}>
            {/* {isOutbound ? itemAsOutbound.outboundQuantity.toLocaleString() : itemAsInbound.inboundQuantity.toLocaleString()} */}
          </td>

          {/* 총량 (입고에만 존재) */}
          {!isOutbound && 
            <td style={{...styles.td, ...styles.tdRight, width: '7%', fontWeight: 'bold'}}>
                {/* {itemAsInbound.totalQuantity.toLocaleString()} */}
                </td>
          }
          
          {/* 입고/출고 일자 */}
          <td style={{...styles.td, ...styles.tdCenter, width: '8%'}}>{isOutbound ? itemAsOutbound.outboundDate : itemAsInbound.inboundDate}</td>

          {/* 제조 일자 (입고에만 존재) */}
          {!isOutbound && 
            <td style={{...styles.td, ...styles.tdCenter, width: '8%'}}>{itemAsInbound.manufactureDate}</td>
          }
          
          {/* 제조사 */}
          <td style={{...styles.td, width: '8%', ...styles.tdCenter}}>{item.manufacturer}</td>

          {/* 액션 버튼 컬럼 */}
          <td style={{...styles.td, width: '15%', ...styles.tdCenter}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: '4px'}}>
              <button 
                style={styles.actionButton('#6b7280')} // 수정 버튼
                onClick={() => handleAction(item, '수정')}
              >
                수정
              </button>
              <button 
                style={styles.actionButton('#ef4444')} // 삭제 버튼
                onClick={() => handleAction(item, '삭제')}
              >
                삭제
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div style={styles.container}>
      
      {/* 1. 네비게이션 탭 (useParams 시뮬레이션) */}
      <div style={styles.navContainer}>
        <button
          style={styles.navTab(currentHistoryType === 'INBOUND', 'INBOUND')}
          onClick={() => handleTypeChange('INBOUND')}
        >
          입고 이력 조회
        </button>
        <button
          style={styles.navTab(currentHistoryType === 'OUTBOUND', 'OUTBOUND')}
          onClick={() => handleTypeChange('OUTBOUND')}
        >
          출고 이력 조회
        </button>
      </div>

      {/* 2. 헤더 */}
      <div style={styles.header(currentHistoryType)}>
        {title}
      </div>
      
      {/* 3. 검색 및 조회 부분 */}
      <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>🔍 검색</h3>
      <form onSubmit={handleSearch} style={styles.searchContainer}>
        <div style={styles.searchGroup}>
          {/* 검색 타입 선택 */}
          <select 
            value={searchKey} 
            onChange={(e) => setSearchKey(e.target.value)}
            style={styles.searchSelect}
          >
            {searchOptions.map(option => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
          
          {/* 검색 바 */}
          <input 
            style={styles.searchInput} 
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* 돋보기 검색 버튼 */}
        <button type="submit" style={styles.searchButton}>
          {/* 돋보기 SVG 아이콘 */}
          <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
      </form>

      {/* 4. 액션 버튼 (Excel 다운로드) */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
        <p style={{fontSize: '14px', color: '#4b5563', fontWeight: '500'}}>총 <span style={{color: '#2563eb', fontWeight: 'bold'}}>{fullData.length.toLocaleString()}</span>건 조회됨</p>
        <button 
          style={styles.excelButton}
          onClick={() => console.log(`${currentHistoryType === 'INBOUND' ? '입고' : '출고'} 데이터 Excel 다운로드 실행`)}
        >
          {/* 다운로드 SVG 아이콘 */}
          <svg style={{width: '20px', height: '20px'}} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          <span>엑셀 다운로드</span>
        </button>
      </div>

      {/* 5. 데이터 테이블 */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th(true, false)}>No.</th>
              <th style={styles.th(false, false)}>{currentHistoryType === 'INBOUND' ? '입고 번호' : '출고 번호'}</th> 
              <th style={styles.th(false, false)}>품목 번호</th>
              <th style={styles.th(false, false)}>품목명</th>
              <th style={styles.th(false, false)}>매입처명</th>
              <th style={styles.th(false, false)}>원자재규격(양/단위)</th>
              <th style={styles.th(false, false)}>{currentHistoryType === 'INBOUND' ? '입고 수량' : '출고 수량'}</th>
              
              {currentHistoryType === 'INBOUND' && <th style={styles.th(false, false)}>총량(규격X수량)</th>}
              
              <th style={styles.th(false, false)}>{currentHistoryType === 'INBOUND' ? '입고 일자' : '출고 일자'}</th>
              
              {currentHistoryType === 'INBOUND' && <th style={styles.th(false, false)}>제조 일자</th>}

              <th style={styles.th(false, false)}>제조사</th>
              <th style={styles.th(false, true)}>액션</th>
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* 6. 페이징 UI 구현 */}
      <div style={styles.paginationContainer}>
        <button 
          style={{...styles.pageButton(false), opacity: currentPage === 1 ? 0.5 : 1}}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>

        {/* 페이지 번호 렌더링 (최대 5개만 표시) */}
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
          style={{...styles.pageButton(false), opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1}}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          다음
        </button>
      </div>
    </div>
  )
}
