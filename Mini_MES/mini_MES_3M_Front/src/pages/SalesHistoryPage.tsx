import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { HistoryType, BaseHistoryItem,InboundItem,OutboundItem,HistoryItem,SearchOption } from '../types/sales_history';
import { useNavigate, useParams } from 'react-router-dom';
import { useSalesHistoryStyles } from '../style/useSalesHistoryStyles';
import { useCommonStyles } from '../style/useCommonStyles';

// ==========================================================
// 2. 상수 및 더미 데이터
// ==========================================================

// 입고 검색 옵션 목록
const INBOUND_SEARCH_OPTIONS: SearchOption[] = [
  { key: '전체', label: '전체' },
  { key: 'customerName', label: '거래처명' },
  { key: 'itemName', label: '품목명' },
  { key: 'itemCode', label: '품목번호' },
  { key: 'inboundNo', label: '입고번호' },
  { key: 'date', label: '입고일자' },
];

// 출고 검색 옵션 목록
const OUTBOUND_SEARCH_OPTIONS: SearchOption[] = [
  { key: '전체', label: '전체' },
  { key: 'customerName', label: '거래처명' },
  { key: 'itemName', label: '품목명' },
  { key: 'itemCode', label: '품목번호' },
  { key: 'outboundNo', label: '출고번호' },
  { key: 'date', label: '출고일자' },
];

// 새로운 분류 및 도장 타입 정의
const COATING_TYPES = ['액체도장', '분체도장'];
const INBOUND_CLASSIFICATION_TYPES = ['자동차', '방산', '일반', '조선'];
const OUTBOUND_CLASSIFICATION_TYPES = ['방산', '자동차', '일반']; 

type CombinedItem = InboundItem | OutboundItem;

// 입고 더미 데이터 (35개)
const DUMMY_INBOUND_DATA: InboundItem[] = Array.from({ length: 35 }, (_, i) => ({
  no: i + 1,
  inboundNo: `IN-${20241001 + i}`,
  customerName: `거래처 A${i % 5}`,
  itemCode: `ITM-00${i % 10}`,
  itemName: `부품명 ${i + 1}`,
  quantity: 100 + i,
  date: `2024-10-${(i % 30) + 1 < 10 ? '0' : ''}${(i % 30) + 1}`,
  coating: COATING_TYPES[i % COATING_TYPES.length], 
  classification: INBOUND_CLASSIFICATION_TYPES[i % INBOUND_CLASSIFICATION_TYPES.length],
}));

// 출고 더미 데이터 (28개)
const DUMMY_OUTBOUND_DATA: OutboundItem[] = Array.from({ length: 28 }, (_, i) => ({
  no: i + 1,
  outboundNo: `OUT-${20241001 + i}`,
  customerName: `거래처 B${i % 4}`,
  itemCode: `ITM-00${i % 8}`,
  itemName: `제품명 ${i + 1}`,
  quantity: 50 + i,
  date: `2024-10-${(i % 28) + 1 < 10 ? '0' : ''}${(i % 28) + 1}`,
  classification: OUTBOUND_CLASSIFICATION_TYPES[i % OUTBOUND_CLASSIFICATION_TYPES.length],
}));

const ITEMS_PER_PAGE = 10;

// ==========================================================
// 3. 컴포넌트 시작
// ==========================================================
export default function App() { 
  // ----------------------------------------------------
  // 1. URL 파라미터 읽기 및 Navigate 훅 설정 (라우팅 시뮬레이션용)
  const { type: urlType } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  // URL에서 읽은 type을 정규화하여 사용 
  const currentHistoryType: HistoryType = 
    urlType?.toUpperCase() === 'OUTBOUND' ? 'OUTBOUND' : 'INBOUND';
  
  // ----------------------------------------------------

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKey, setSearchKey] = useState<string>('전체'); 

  // 페이징 및 데이터 상태
  const [fullData, setFullData] = useState<HistoryItem[]>(DUMMY_INBOUND_DATA); 
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null); // 행 호버 상태

  // --- 스타일 정의 ---
  const styles = {
    ...useCommonStyles(),
    ...useSalesHistoryStyles()
  };

  // --- 동적 설정 계산 (URL type에 의존) ---
  const { title, placeholder, searchOptions, dummyData } = useMemo(() => {
    if (currentHistoryType === 'INBOUND') {
      return {
        title: '수주품목 입고 이력조회',
        placeholder: '거래처명, 품목명, 품목번호, 입고번호, 입고일자로 검색해주세요',
        searchOptions: INBOUND_SEARCH_OPTIONS,
        dummyData: DUMMY_INBOUND_DATA as HistoryItem[],
      };
    } else { // OUTBOUND
      return {
        title: '수주품목 출고 이력조회',
        placeholder: '거래처명, 품목명, 품목번호, 출고 번호, 출고 일자로 검색해주세요',
        searchOptions: OUTBOUND_SEARCH_OPTIONS,
        dummyData: DUMMY_OUTBOUND_DATA as HistoryItem[],
      };
    }
  }, [currentHistoryType]); 

  // URL type (currentHistoryType)이 변경될 때마다 데이터 및 검색 조건 초기화
  useEffect(() => {
    setFullData(dummyData); 
    setSearchTerm('');
    setSearchKey('전체');
    setCurrentPage(1);
  }, [currentHistoryType, dummyData]); 

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

      if (searchKey === '전체') {
        const itemAsInbound = item as InboundItem;
        const itemAsOutbound = item as OutboundItem;

        searchKeyStr = `${item.customerName} ${item.itemCode} ${item.itemName} ${item.date} ${item.classification} ${itemAsInbound.coating || ''} ${itemAsInbound.inboundNo || ''} ${itemAsOutbound.outboundNo || ''}`;
      } else {
        if (searchKey === 'inboundNo' || searchKey === 'outboundNo') {
            searchKeyStr = (currentHistoryType === 'INBOUND' ? (item as InboundItem).inboundNo : (item as OutboundItem).outboundNo);
        } else {
            searchKeyStr = item[searchKey as keyof BaseHistoryItem]?.toString(); 
        }
        
        if (currentHistoryType === 'INBOUND' && searchKey === 'coating') {
          searchKeyStr = (item as InboundItem).coating;
        }
      }

      return searchKeyStr?.toLowerCase().includes(lowerSearchTerm);
    });
    
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

  // --- 액션 핸들러 (수정/삭제/문서 버튼) ---
  const handleAction = (item: CombinedItem, actionType: string) => {
    console.log(`${actionType} 버튼 클릭:`, item);

    if (actionType === '작업 지시서' && 'inboundNo' in item) { // '작업 지시서' 버튼 클릭 시
      navigate(`/work-order/${item.inboundNo}`); // ✨ 작업 지시서 페이지로 이동 (inboundNo 전달)
    } else if (actionType === '출하증' && 'outboundNo' in item) { // '출하증' 버튼 클릭 시
      navigate(`/shipping-certificate/${item.outboundNo}`); // ✨ 출하증 페이지로 이동 (outboundNo 전달)
    } else {
      // '수정' 또는 '삭제' 버튼에 대한 로직
      // 예를 들어 모달을 띄우거나 다른 페이지로 이동
      console.log(`${item.customerName}의 ${actionType}을(를) 처리합니다.`);
    }
  };

  // ----------------------------------------------------
  // 2. 모드 전환 버튼 핸들러 (navigate를 사용하여 URL 변경)
  const handleModeChange = useCallback((newType: HistoryType) => {
    const path = newType === 'INBOUND' ? 'inbound' : 'outbound';
    // 실제 환경에서는 navigate(`/order/history/${path}`)를 사용합니다.
    console.log(`모드 전환: /order/history/${path}`);
    // Note: 단일 파일 환경에서는 useParams가 동적으로 업데이트되지 않으므로, 
    // 실제 라우팅이 필요하다면 이 컴포넌트를 Router로 감싸야 합니다. 
    // 여기서는 console.log로 대체하고, default 값에 의존합니다.
  }, []);
  // ----------------------------------------------------

  // --- 헬퍼 함수: 분류 색상 ---
  const getClassificationStyle = (classification: string): { bg: string; text: string } => {
    switch (classification) {
      case '자동차': return { bg: '#e0e7ff', text: '#4338ca' }; // indigo
      case '방산': return { bg: '#fce7f3', text: '#be185d' }; // pink
      case '조선': return { bg: '#ccfbf1', text: '#0f766e' }; // teal
      case '일반': return { bg: '#f3f4f6', text: '#374151' }; // gray
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  }

  // --- 렌더링 함수 ---
  const renderTableBody = () => {
    const colSpanCount = currentHistoryType === 'INBOUND' ? 9 : 8; 

    if (currentData.length === 0) {
      return (
        <tr key="no-data">
          <td colSpan={colSpanCount} style={styles.td}>
            조회된 데이터가 없습니다.
          </td>
        </tr>
      );
    }

    return currentData.map((item, index) => {
      const displayNo = (currentPage - 1) * ITEMS_PER_PAGE + index + 1; 
      const uniqueKey = `${currentHistoryType}-${(item as InboundItem).inboundNo || (item as OutboundItem).outboundNo}-${item.no}`;
      const classificationStyle = getClassificationStyle(item.classification);
      const isHovered = hoveredRow === uniqueKey;

      return (
        <tr 
            key={uniqueKey} 
            style={isHovered ? styles.tdHover : {}} 
            onMouseEnter={() => setHoveredRow(uniqueKey)}
            onMouseLeave={() => setHoveredRow(null)}
        >
          <td style={{...styles.td, width: '5%'}}>{displayNo}</td>
          
          {/* 입고/출고 번호 */}
          <td style={{...styles.td, width: '12%', fontWeight: '500'}}>
            {currentHistoryType === 'INBOUND' ? (item as InboundItem).inboundNo : (item as OutboundItem).outboundNo}
          </td>
          
          <td style={{...styles.td, width: '15%'}}>{item.customerName}</td>
          <td style={{...styles.td, width: '10%'}}>{item.itemCode}</td>
          <td style={{...styles.td, width: '15%', fontSize: '12px'}}>{item.itemName}</td>
          <td style={{...styles.td, width: '8%', fontWeight: 'bold', color: '#1d4ed8'}}>{item.quantity.toLocaleString()}</td>
          <td style={{...styles.td, width: '10%'}}>{item.date}</td>

          {/* 도장 컬럼은 입고에만 존재 */}
          {currentHistoryType === 'INBOUND' && 
            <td style={{...styles.td, width: '5%'}}>
                <span 
                    style={styles.badge(
                        ((item as InboundItem).coating === '액체도장') ? '#fffbe2' : '#f3e8ff', 
                        ((item as InboundItem).coating === '액체도장') ? '#92400e' : '#6b21a8' 
                    )}
                >
                    {(item as InboundItem).coating}
                </span>
            </td>
          }
          
          <td style={{...styles.td, width: '5%'}}>
            <span style={styles.badge(classificationStyle.bg, classificationStyle.text)}>
              {item.classification}
            </span>
          </td>

          {/* 액션 버튼 컬럼 */}
          <td style={{...styles.td, width: '20%'}}>
            <div style={{display: 'flex', justifyContent: 'center', gap: '4px'}}>
              <button 
                style={styles.actionButton('#6b7280')} // gray-500
                onClick={() => handleAction(item, '수정')}
              >
                수정
              </button>
              <button 
                style={styles.actionButton('#ef4444')} // red-500
                onClick={() => handleAction(item, '삭제')}
              >
                삭제
              </button>
              <button 
                style={styles.actionButton(currentHistoryType === 'INBOUND' ? '#10b981' : '#3b82f6')} // green-500 / blue-500
                onClick={() => handleAction(item, currentHistoryType === 'INBOUND' ? '작업 지시서' : '출하증')}
              >
                {currentHistoryType === 'INBOUND' ? '지시서' : '출하증'}
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div style={styles.container}>
      {/* 1. 헤더 (모드 전환 기능) */}
      <div style={styles.header(currentHistoryType)}>
        {title}
      </div>
      <div style={{marginBottom: '24px', display: 'flex', gap: '12px'}}>
        {/* <button 
            onClick={() => handleModeChange('INBOUND')} 
            style={styles.modeButton(currentHistoryType === 'INBOUND', 'INBOUND')}
        >
          입고 이력 조회
        </button>
        <button 
            onClick={() => handleModeChange('OUTBOUND')} 
            style={styles.modeButton(currentHistoryType === 'OUTBOUND', 'OUTBOUND')}
        >
          출고 이력 조회
        </button> */}
      </div>

      {/* 2. 검색 및 조회 부분 */}
      <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>Q 검색</h3>
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

      {/* 3. 액션 버튼 (Excel 다운로드) */}
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

      {/* 4. 데이터 테이블 */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th(true, false)}>No.</th>
              <th style={styles.th(false, false)}>{currentHistoryType === 'INBOUND' ? '입고 번호' : '출고 번호'}</th> 
              
              <th style={styles.th(false, false)}>거래처명</th>
              <th style={styles.th(false, false)}>품목 번호</th>
              <th style={styles.th(false, false)}>품목명</th>
              <th style={styles.th(false, false)}>{currentHistoryType === 'INBOUND' ? '입고 수량' : '출고 수량'}</th>
              <th style={styles.th(false, false)}>{currentHistoryType === 'INBOUND' ? '입고 일자' : '출고 일자'}</th>
              
              {currentHistoryType === 'INBOUND' && <th style={styles.th(false, false)}>도장</th>}
              
              <th style={styles.th(false, false)}>분류</th>
              <th style={styles.th(false, true)}>액션</th>
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
  );
}
